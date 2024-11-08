export default (): any => ({
  database: {
    type: 'postgres',
    host: 'ep-lucky-scene-a13gac0r.ap-southeast-1.aws.neon.tech',
    username: 'scheduler_owner',
    password: '7dAbBeq4vZFg',
    database: 'scheduler',
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    synchronize: true,
    ssl: process.env.POSTGRES_SSL,
  },
});
