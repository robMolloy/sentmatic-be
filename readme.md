# sentmatic-be

## getting started

- `npm i`
- if you have never used the firebase emulator before (the following is just to install the emulator);
  - delete `.firebaserc` file
  - `firebase init` which should start the CLI wizard
  - select `emulators` then proceed
  - select `Don't set up a default project` then proceed
  - select `Authentication`, `Functions`, `Firestore` and `Storage` then proceed
  - select `Y` for all other prompts
  - once complete use git to revert all changes
- `npm run dev1` to build the functions (wait for this to build the lib directory)
- `npm run dev2` to start the emulator
- (optional) `npm run dev3` to run the tests

## BE/FE checklist

- [x] create back-end functionality that allows a user to create a stripe paymentIntent
- [ ] create front-end functionality that allows a user to get a paymentIntent from the back-end
- [ ] create front-end functionality that allows a user to make a card payment to fulfill a payment
- [ ] create front-end functionality that allows a user to provide the paymentIntentId to the back-end
- [x] create back-end functionality that takes the paymentIntentId and increment the user's balance if the successful paymentIntent hasn't already been used then update the paymentIntentDoc to accountDebited:true

## FE SDK

1. createStripePaymentIntent (functions)
2. createPaymentIntentDoc (firestore - paymentIntentDoc:create)
3. confirmUserOwnsUnpaidPaymentIntentDoc (firestore - paymentIntentDoc:get)
4. uploadDoc (firestore - balance:update, fileDocs:create, storage - files:create)

## FE progression SDK

- [NMP] fulfillStripePaymentIntent (stripe)
- ~~refundFailedUploadDoc (stripe:refund, firestore - balance:update, files:delete)~~

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
