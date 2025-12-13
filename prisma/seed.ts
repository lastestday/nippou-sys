import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.reportComment.deleteMany();
  await prisma.visitRecord.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();

  console.log('✨ Cleared existing data');

  // Seed Employees
  const manager = await prisma.employee.create({
    data: {
      name: '山田太郎',
      email: 'yamada@example.com',
      department: '営業部',
      position: '部長',
    },
  });

  const salesRep1 = await prisma.employee.create({
    data: {
      name: '佐藤花子',
      email: 'sato@example.com',
      department: '営業部',
      position: '営業担当',
      managerId: manager.id,
    },
  });

  const salesRep2 = await prisma.employee.create({
    data: {
      name: '鈴木一郎',
      email: 'suzuki@example.com',
      department: '営業部',
      position: '営業担当',
      managerId: manager.id,
    },
  });

  console.log('👥 Created employees:', {
    manager: manager.name,
    salesRep1: salesRep1.name,
    salesRep2: salesRep2.name,
  });

  // Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: '株式会社ABC商事',
      contactPerson: '田中一郎',
      phone: '03-1234-5678',
      email: 'tanaka@abc-shoji.co.jp',
      address: '東京都千代田区丸の内1-1-1',
      industry: '製造業',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: '株式会社XYZシステムズ',
      contactPerson: '高橋美咲',
      phone: '03-9876-5432',
      email: 'takahashi@xyz-systems.co.jp',
      address: '東京都港区六本木2-2-2',
      industry: 'IT・情報通信',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: '有限会社サンプル商店',
      contactPerson: '伊藤健太',
      phone: '06-1111-2222',
      email: 'ito@sample-store.co.jp',
      address: '大阪府大阪市中央区本町3-3-3',
      industry: '小売業',
    },
  });

  console.log('🏢 Created customers:', {
    customer1: customer1.name,
    customer2: customer2.name,
    customer3: customer3.name,
  });

  // Seed Daily Reports with Visit Records
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const report1 = await prisma.dailyReport.create({
    data: {
      employeeId: salesRep1.id,
      reportDate: today,
      problem: '新規顧客の開拓が思うように進んでいない。既存顧客からの追加注文も減少傾向にある。',
      plan: '明日はABC商事とXYZシステムズを訪問し、新製品の提案を行う予定。また、既存顧客へのフォローアップを強化する。',
      status: 'submitted',
      visitRecords: {
        create: [
          {
            customerId: customer1.id,
            visitContent: '新製品の提案および見積もり提出。担当者から好感触を得た。次回は技術担当者を交えての打ち合わせを実施予定。',
            visitTime: new Date('2024-01-01T10:00:00'),
            displayOrder: 1,
          },
          {
            customerId: customer2.id,
            visitContent: 'システム導入後のフォローアップ。一部機能について追加要望あり。次回訪問時に詳細ヒアリングを実施する。',
            visitTime: new Date('2024-01-01T14:30:00'),
            displayOrder: 2,
          },
        ],
      },
    },
  });

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const report2 = await prisma.dailyReport.create({
    data: {
      employeeId: salesRep2.id,
      reportDate: yesterday,
      problem: '競合他社の価格攻勢により、価格面での競争が激化している。',
      plan: '価格以外の付加価値（サポート体制、納期短縮等）を強調した提案を行う。',
      status: 'reviewed',
      visitRecords: {
        create: [
          {
            customerId: customer3.id,
            visitContent: '定期訪問。店舗の在庫状況を確認し、追加発注を受注。次回配送日程を調整した。',
            visitTime: new Date('2024-01-01T11:00:00'),
            displayOrder: 1,
          },
        ],
      },
    },
  });

  console.log('📝 Created daily reports:', {
    report1: `${salesRep1.name} - ${today.toISOString().split('T')[0]}`,
    report2: `${salesRep2.name} - ${yesterday.toISOString().split('T')[0]}`,
  });

  // Seed Report Comments
  const comment1 = await prisma.reportComment.create({
    data: {
      reportId: report1.id,
      commenterId: manager.id,
      commentText: '新製品の提案、お疲れ様です。技術担当者との打ち合わせでは、製品の優位性をしっかりアピールしてください。',
      commentType: 'problem',
    },
  });

  const comment2 = await prisma.reportComment.create({
    data: {
      reportId: report1.id,
      commenterId: manager.id,
      commentText: '既存顧客へのフォローアップ計画、良いですね。定期的な訪問を心がけてください。',
      commentType: 'plan',
    },
  });

  const comment3 = await prisma.reportComment.create({
    data: {
      reportId: report2.id,
      commenterId: manager.id,
      commentText: '価格競争については、総合的な提案力で差別化を図りましょう。サポート体制の充実をアピールするのは良い戦略です。',
      commentType: 'general',
    },
  });

  console.log('💬 Created comments:', {
    comment1: 'Problem comment on report1',
    comment2: 'Plan comment on report1',
    comment3: 'General comment on report2',
  });

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
