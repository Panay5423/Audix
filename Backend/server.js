import app from "./app.js"
import connect_DB from "./config/connect.DB.js"


connect_DB().then(() => {

    app.listen(process.env.PORT, () => {
        console.log(`server is running on port http://localhost:${process.env.PORT}`)
    })


}).catch((error) => {
    console.log("MongoDb connection failed")
    process.exit(0)
})