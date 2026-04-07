Arrays.asList(new Document("$unwind", 
    new Document("path", "$order_lines")), 
    new Document("$group", 
    new Document("_id", "$order_lines.product_id")
            .append("total", 
    new Document("$sum", 1L))), 
    new Document("$sort", 
    new Document("total", -1L)), 
    new Document("$group", 
    new Document("_id", 
    new BsonNull())
            .append("maxval", 
    new Document("$first", "$total"))
            .append("allProduct", 
    new Document("$push", 
    new Document("p_id", "$_id")
                    .append("total", "$total")))), 
    new Document("$unwind", 
    new Document("path", "$allProduct")), 
    new Document("$match", 
    new Document("$expr", 
    new Document("$eq", Arrays.asList("$allProduct.total", "$maxval")))), 
    new Document("$lookup", 
    new Document("from", "product_w_header")
            .append("localField", "allProduct.p_id")
            .append("foreignField", "product_id")
            .append("as", "product_info")), 
    new Document("$unwind", 
    new Document("path", "$product_info")), 
    new Document("$project", 
    new Document("_id", 0L)
            .append("product_id", "$allProduct.p_id")
            .append("product_name", "$product_info.product_name")), 
    new Document("$sort", 
    new Document("product_id", 1L)))
