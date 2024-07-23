## To manually Register the fuunction 

1. Query Shopify Functions

```{
  shopifyFunctions(first: 10) {
    edges {
      node {
        id
        title
        apiVersion
        inputQuery
      }
    }
  }
}
```
2. Note ID of the discount-allocator function i.e. 799b0454-8c13-48a5-a1c7-8ed3005be93c

3. Register the discount allocator 

```mutation registerDiscountsAllocator($functionExtensionId: String!) {
        discountsAllocatorFunctionRegister(functionExtensionId: $functionExtensionId) {
          userErrors {
            code
            message
            field
          }
        }
      }
 ``` 
  Variable :
```
{ 
  "functionExtensionId": "799b0454-8c13-48a5-a1c7-8ed3005be93c"
}
```