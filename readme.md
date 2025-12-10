npm run dev

POST http://localhost:4000/api/recovery/recover

{
  "email": "flo",
  "destino": "unemailreal@tellegauncodigo.com"
}


POST http://localhost:4000/api/recovery/reset

{
  "email": "flo",
  "code": "464809",
  "newPassword": "123456"
}