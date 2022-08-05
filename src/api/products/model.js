import mongoose from "mongoose"

const { Schema, model } = mongoose

const productsSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: {type: Number , required: true},
    category: {type: String},
    
    
      reviews:[{comment: String  , rate: Number }]
  },
  {
    timestamps: true, 
  }
)

export default model("Product", productsSchema) 