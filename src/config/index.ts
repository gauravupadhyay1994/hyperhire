export default (): any => ({
  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    username: process.env.POSTGRES_USERNAME || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'hyperhire_backend',
    database: process.env.POSTGRES_DATABASE || 'postgres',
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    synchronize: true,
    ssl: process.env.POSTGRES_SSL,
  },
});
