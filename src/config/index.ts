export default (): any => ({
  database: {
    type: 'postgres',
    host: 'dpg-csnmj00gph6c73bh8l2g-a',
    username: 'gaurav',
    password: 'qD1jEiNR5MikJaaffLEtsF0tHhQnMZcx',
    database: 'hyperhire',
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    synchronize: true,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
