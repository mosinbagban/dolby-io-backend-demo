const MONGOUSER=process.env.MONGOUSER;
const MONGOPWD=process.env.MONGOPWD;
module.exports = {
  // url: "mongodb://localhost:3000/dolbyio_db"
  /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
    url: `mongodb+srv://${MONGOUSER}:${MONGOPWD}@cluster0.v3ofyot.mongodb.net/?retryWrites=true&w=majority`
};
