const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('colors');
require('dotenv').config()

// middle Wares
app.use(cors());
app.use(express.json());


app.get('/', (req, res) =>{
    res.send('Genius car is running')
})




const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dkggbgt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    
    
  } 
  catch (err){
    // await client.close();
    console.log(err.name.bgRed, err.message.bold, err.stack)
  }
}
run();

const Service = client.db("geniusCar").collection('services');
const Order = client.db("geniusCar").collection('orders');

// endpoint
// app.post('/services', async (req, res) =>{
//     try {
        
//     } catch (error) {
//         res.send()
//     }
// })

app.get('/services', async(req, res) =>{
    try {
        const query = {};
        const cursor = Service.find(query);
        const service = await cursor.toArray();
        res.send({
            success: true,
            message: (`Successfully got the data`),
            data: service
        }) 
        
    } catch (error) {
        console.log(error.name.bgRed, error.message.bold)
        res.send({
            success: false,
            error: error.message
        })
    }
})


// For go to specific id 
app.get('/services/:id', async(req, res) =>{
    try {
        const {id }= req.params;
        const query = {_id: new ObjectId(id)}
        const service = await Service.findOne(query)
        res.send({
            success: true,
            data: service
        })

    } catch (error) {
        res.send({
            success:false,
            error: error.message,
        })
    }
})

// Orders api

app.get('/orders', async(req, res)=>{
    console.log(req.query.email);
    try {
        let query ={};
        if(req.query.email){
            query = {
                email:req.query.email,
            }
        }
        const cursor = Order.find(query)
        const order = await cursor.toArray();
        
        res.send({
            success: true,
            message: ('All Orders is Here'),
            data: order
        })
    } catch (error) {
        
    }
})



app.post('/orders', async (req, res)=>{
    try {
        const body = req.body;
        const order = await Order.insertOne(body)
        if(order.insertedId){
            res.send({
                success: true,
                message: (`Order has been placed Successfully`),
                data:order
            })
        }
        else{
            res.send({
                success:false,
                error: ('Could`t place the order')
            })
        }
    } catch (error) {
        
    }
})

app.patch('/orders/:id', async (req, res) =>{
    try {
        const {id} = req.params;
        const status = req.body.status;
        const filter = {_id: new ObjectId(id)};
        const options = {upsert: true};
        const updateOrder = {
            $set:{
                status:status,
            }
        }
        const result = await Order.updateOne(filter, updateOrder, options)
        if(result.modifiedCount){
            res.send({
                success: true, 
                message: ('Successfully update your Order'),
            })
        }
        else{
            res.send({
                success: false,
                error: ('Something went wrong please try again')
            })
        }
        
    } catch (error) {
        console.log(error.name.bgRed, error.message)
    }
})

app.delete('/orders/:id', async(req, res)=>{
    try {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await Order.deleteOne(query);
       
        if(result.deletedCount){
            res.send({
                success:true,
                message: 'Your order has been successfully deleted',
            })
        }
        else{
            res.send({
                success:false,
                error: ('Order not deleted yet, please try again')
            })
        } 
        
    } catch (error) {
        
    }
})


app.listen(port, ()=>{
    console.log(`Genius car is running on the port ${port}`)
})