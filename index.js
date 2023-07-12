const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

// Secret jwt token method 


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dkggbgt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// JWT TOKEN FUNCTION
function verifyJWT(req, res, next ){
    const authHeader = req.headers.authorization;
    if(!authHeader){                                                                /* amra client side e order er modde ekta authorization set koresi r sheita check kore dekhteci ja ase kina */
       return res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];                                          /* 38 - 44 eita hosse token varify method */
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){  
        if(err){
           return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next(); /* eita default functtion eita k call na korle kaj hobe na */
    })
}

async function run() {
  try {
    
    
    
  } 
  catch (err){
    // await client.close();
    console.log(err.name.bgRed, err.message.bold, err.stack)
  }
}
run();

const Service = client.db("geniusCar").collection('services');
const Order = client.db("geniusCar").collection('orders');


app.get('/services', async(req, res) =>{
    try {
        const search = req.query.search
        console.log(search)
        let query = {
            $text:{
                $search:search
            }
        };
        // if(search.length){
        //     query = {
        //         $text: {
        //             $search: search
        //         }
        //     }
        // }
        const order = req.query.order === 'asc' ? 1 : -1;
        const cursor = Service.find(query).sort({price: order});
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

app.get('/orders', verifyJWT, async(req, res)=>{
    const decoded = req.decoded;

    if(decoded.email !== req.query.email){
        res.status(403).send({message: 'unauthorized  access'})
    }
    
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



app.post('/orders', verifyJWT, async (req, res)=>{
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

app.patch('/orders/:id', verifyJWT, async (req, res) =>{
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

app.delete('/orders/:id', verifyJWT, async(req, res)=>{
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


// JWT API 
app.post('/jwt', (req, res)=>{               /* for login page- customer jokhn login korbe tokhn amra token dibo */
   const user = req.body;
   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
   res.send({token})
})


app.listen(port, ()=>{
    console.log(`Genius car is running on the port ${port}`)
})
