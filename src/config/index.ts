export default (): any => ({
  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    synchronize: true,
    ssl: process.env.POSTGRES_SSL,
  },
});
