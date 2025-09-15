import app from "./app";
import { AppDataSource } from "./data-source";

const PORT = 3000;

AppDataSource.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Erro durante a inicialização da fonte de dados:", error);
    });