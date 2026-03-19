# API-to.do
/*
    ALUNO: Vinícius Junges
*/

http://localhost:3000/users POST

{
  "name": "Profe",
  "email": "profe@email.com",
  "password": "senha_super_segura"
}

http://localhost:3000/auth POST

{
  "email": "profe@email.com",
  "password": "senha_super_segura"
}

http://localhost:3000/todos POST

{
  "task": "Avançar no mapa conceitual de IoT, redes e drones"
}

http://localhost:3000/todos PUT

{
  "task": "Testar a minha nova API do início ao fim (CONCLUÍDO!)",
  "finished": true
}
