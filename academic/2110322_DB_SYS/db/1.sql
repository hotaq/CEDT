Arrays.asList(new Document("$group", 
    new Document("_id", "$customer_zipcode")
            .append("total", 
    new Document("$sum", 1L))), 
    new Document("$sort", 
    new Document("total", -1L)))
