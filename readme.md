# sentmatic-be

1. create back-end functionality that allows a user to create a stripe paymentIntent
2. create front-end functionality that allows a user to get a paymentIntent from the back-end
3. create front-end functionality that allows a user to make a card payment to fulfill a payment
4. create front-end functionality that allows a user to provide the paymentIntentId to the back-end
5. create back-end functionality that takes the paymentIntentId and increment the user's balance if the successful paymentIntent hasn't already been used then update the paymentFulfilledDocument

## payment flow

- user creates a paymentIntent
- user fulfills paymentIntent
- user creates a paymentIntentDoc
  - id of paymentIntentId
  - uid == uid
  - paymentIntentDocId == paymentIntentDocId
  - accountDebitted == false
- user calls confirmSuccessfulStripePaymentAndUpdateBalanceDoc
  - get paymentIntentDoc
    - if paymentIntentDoc.accountDebitted == true break
  - get paymentIntent
    - if paymentIntent.status != success break
    - if paymentIntent.currency != usd break
    - if paymentIntent.amount <= 0 break
  - update balanceDoc by paymentIntent.amount
  - update paymentIntentDoc.accountDebitted == true

## create file flow

- user updates their balanceDoc;
  - decreases value by cost (300)
  - increment currentUploadIntentNumber by 1
  - add uploadIntentId to uploadIntentIds
- user creates an uploadIntentDoc
  - id == `${uid}_${currentUploadIntentNumber}`
- user uploads a file
  - id == `${uid}_${currentUploadIntentNumber}` (max size 50*1024*1024)
- file upload causes an order to be created
  - watch for file upload to complete
  - create orderDoc with admin
