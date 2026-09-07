import {Sequelize} from 'sequelize';


export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.PASSWORD,

    {
        host : process.env.DB_HOST,
        dialect : 'mysql',
    }
);

export const connectDB = async () => {
    try{
        await sequelize.authenticate();
        await sequelize.sync()
        console.log('Conexion a MySQL establecida correctamente');
    } catch (e) {
        console.error('error al conectar con la base de datos',e);
        process.exit(1);
    }
};
