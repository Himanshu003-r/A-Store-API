const Product = require('../models/product')

const getAllProductsStatic = async (req,res) => {

    const product = await Product.find({ price: { $gt:30 } })
    .sort('price')
    .select('name price')
    // .limit(10)
    // .skip(1) // skips the 1st item
    res.status(200).json({product, nbHits: product.length})
}
const getAllProducts = async (req,res) => {
    const {featured,company,name,sort,fields,numericFilters} = req.query
    const queryObject = {}
    if(featured){
        queryObject.featured = featured === 'true'? true : false
    }
    if(company){
        queryObject.company = company
    }
    if(name){
        queryObject.name = {$regex:name,$options: 'i'}
    }
    if(numericFilters){
        const operatorMap = {
            '>':'$gt',
            '>=':'$gte',
            '-':'$eq',
            '<':'$lt',
            '<=':'$lte',
        }
       const regEx = /\b(<|>|>=|=|<|<=)\b/g
       let filters = numericFilters.replace(
        regEx,
        (match) => `-${operatorMap[match]}-`)
       const options= ['price','rating'];
       filters = filters.split(',').forEach(item => {
            const [field,operator,value] = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator]:Number(value)}
            }
       });
       
    }
    console.log(queryObject);
    let result = Product.find(queryObject)
    if(sort){
       const sortList = sort.split(',').join(' ')     
       result = result.sort(sortList)
    }
    else{
        result = result.sort('createdAt')
    }
    if(fields){
        const fieldsList = fields.split(',').join(' ')     
        result = result.sort(fieldsList)    
    }
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page -1) * limit;
    result = result.skip(skip).limit(limit)
// 23 total items 
// limit to 7  : 23/7 = 4 pages (7 7 7 2)

    const product = await result
    res.status(200).json({product, nbHits: product.length})
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}