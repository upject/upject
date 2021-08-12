# Saleshub Partner API Reference

## Authentication

To access the Saleshub Partner API you can use your existing account(s), with the same privilege levels as in the application. The username is your email address,
but instead of your password, you have to retrieve the API key from the web application:

* Log in to Saleshub/MaCS
* Go to "Edit Profile"
* Scroll down to "Show API Key"
* Click the link, enter your password once again, and the API key will be displayed

Once you have the API key, you can use it for all the HTTP requests like this:

```
https://<email>:<apikey>@macs.canon.ch/data/....
```
## Fetching Data from Saleshub

Data retrieved from Saleshub is in **CSV format**, as it is more compact than JSON, and this kind of data tends to come in large volumes (e.g. the product catalogue).

### Products

```
GET https://<email>:<apikey>@macs.canon.ch/data/outbound/Product/erpexchange
```

This provides the entire product catalogue according to your accreditation, including prices assigned to your account, one product per row.

#### Format

This is basically the same report, as when logging in to Saleshub/MaCS, and downloading the "Product Master" from the "Reports" menu.

### Product Assignments

```
GET https://<email>:<apikey>@macs.canon.ch/data/outbound/ProductDependency/erpexchange
```
This endpoind provides a CSV, which only contains the assignments from accessories/consumables/services to the machine main bodies. You can use this to find all products
which are related to a certain machine, etc.

#### Format

```
model_articlenum;articlenum
239487234AA;88123911AB
239487234AA;88123912AB
239487662AA;52394222AA
```

### Quote Items

```
GET https://<email>:<apikey>@macs.canon.ch/data/outbound/QuoteOptionItem/erpexchange
```

This endpoint returns all items from orderable (e.g. confirmed) quotes and their agreed project prices.

### Format

```
Quote ID;Quote Name;Valid Until;Articlenumber;Open Quantity;Project Price
2213 / 61772;Project ABC;2021-07-31;239487234AA;4;3500.00
2213 / 61772;Project ABC;2021-07-31;88123911AB;4;600.00
2216 / 61800;Project XYZ;2021-08-01;239487662AA;1;1265.00
```

## Submitting Orders to Saleshub

You can place orders using the API by issuing a POST request, with the request body containing the payload in JSON format. The incoming data is validated immediatly
and you will get instant feedback about the success or failure of the order.

```
POST https://<email>:<apikey>@macs.canon.ch/data/inbound/Order/erpexchange
```

Depending on whether you want to place an order with standard prices, or you want to issue an order out of a confirmed project request/quote, you can ommit or include certain fields.

### Standard order

```JSON
{
  "customer_order_number": "My Order 1234",
  "billing_site_number": "1234567",
  "shipping_site_number": "567890",
  "wanted_pickup_date": "2021-08-12",
  "comment": "URGENT!",
  "items": [
    {
      "articlenumber": "239487234AA",
      "quantity": 4,
      "price": 4000.0
    },
    ...
  ]
}
```

The billing and shipping site numbers identify your addresses within the Canon database. Please contact Canon to get your list of site numbers.

It is important that the prices included in the above data are the same as the prices downloaded via the **Products Endpoint** (see above), otherwise, the order will fail.

#### Error messages

In case everything went well, the endpoint will return

```JSON
{"status": "ACCEPTED"}
```

Otherswise, it will return

```JSON
{
  "status": "REJECTED",
  "errors": [
    {
      "code": "...",
      "message": "...."
    }
  ]
}
```

with one or more of the following error messages:

|Code               | Meaning                               |
|-------------------|---------------------------------------|
|INVALID_JSON       | The JSON data is malformed            |
|BILLING_SITE_NUMBER_REQUIRED| You did not provide a billing site number |
|UNKNOWN_BILLING_SITE_NUMBER | The billing site number you provided is unknown to the application |
|UNKNOWN_SHIPPING_SITE_NUMBER| The shipping site number you provided is unknown to the application |
|INVALID_PICKUP_DATE         | The wanted pickup date is not in the right format (YYYY-MM-DD) |
|UNKNOWN_PRODUCT             | You provided an articlenumber which is either unknown to the application, or you do not have access to |
|PRICE_MISMATCH              | The price you requested does not match your assigned price (it has to be the sames as the one received via the Products endpoint |


### Ordering Quote/Project items

The JSON payload is almost the same as with a standard order above, the only exception is that the **Quote ID** is included for each item. The Quote ID is provided
via the **Quote Items** endpoind (see above).

```JSON
{
  "customer_order_number": "My Order 1234",
  "billing_site_number": "1234567",
  "shipping_site_number": "567890",
  "wanted_pickup_date": "2021-08-12",
  "comment": "URGENT!",
  "items": [
    {
      "articlenumber": "239487234AA",
      "quantity": 4,
      "price": 4000.0,
      "quote_id": "2213 / 61772"
    },
    ...
  ]
}
```

#### Error messages

Additionally to the error messages from the standard order, the following messages might be returned for a quote order:

|Code               | Meaning                                    |
|-------------------|--------------------------------------------|
|UNKNOWN_QUOTE      | No quote with the quote ID you provided could be found |
|QUOTE_NOT_ORDERABLE| The quote with the quote ID you provided is not in a confirmed/orderable state|
|UNKNOWN_CONFIGURATION | The configuration from the quote ID you provided could not be found (the configuration ID is the portion after the "/" in the Quote ID field |
|INVALID_QUANTITY      | The quantity you try to order exceeds the open/retrievable quantity of the line in the quote |
|PRODUCT_NOT_IN_QUOTE  | There is no product with the articlenumber you provided in the quote |
|PRICE_MISMATCH        | The price you are requesting does not match the agreed/confirmed price in the quote|

