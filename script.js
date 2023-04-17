'use strict';
/////////////////////////////////////////////////////////////////////
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-04-15T10:36:17.929Z',
    '2023-04-16T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2023-04-15T10:36:17.929Z',
    '2023-04-16T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];
///////////////////////////////////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//////////////////////////////////////////////////////////////////////////////////////

//Functions


//this function will upadate the dashboard movement UI depending on the movement type
//////////////////////////////////////////////////////////////
const displayMovements = (account,sort=false) => {
  
  containerMovements.innerHTML=``;

const moves= sort ? account.movements.slice().sort((current,next) => current-next ):account.movements;

moves.forEach((mov,i) => {

  //gitting the corosponding date in the array
  const date =new Date(account.movementsDates[i]);
  //formating the date
  const formattedDate= formatMovementDate(date);
  const formattedNumber=intlCurrency(account,mov)
 
  //defining the movement type 
  const movType= mov < 0 ? "withdrawal":"deposit";

  //declaring the html body
  const html=`
  <div class="movements__row">
          <div class="movements__type movements__type--${movType}">${i+1} ${movType}</div>
          <div class="movements__date">${formattedDate}</div>
          <div class="movements__value">${formattedNumber}</div>
        </div>
  `
  //attatch the html to the movements container
  containerMovements.insertAdjacentHTML("afterbegin",html)
})}

//////////////////////////////////////////////////////////////////////
//this function will internationlize currency 
const intlCurrency =(account,number)=>{
const numberFormat = new Intl.NumberFormat(account.language,{
  style:`currency`,
  currency:account.currency
}).format(number);
return numberFormat
}

//this function will calculate the days passed and return how many days
//////////////////////////////////////////////////////////////
const formatMovementDate= (date)=>{
  const calcDaysPassed=(day1,day2)=> {return Math.round(Math.abs(day2-day1)/(1000*60*60*24))};
  const daysPassed= calcDaysPassed(new Date(),date);

  if(daysPassed===0 )return `Today`;
  if(daysPassed===1 )return `Yesterday`;
  if(daysPassed>1 )return `${daysPassed} days ago`;
}

//this function will take each first letter from the fullname and make it a username
//////////////////////////////////////////////////////////////
const createUserName = (accs)=> {
  accs.forEach( account => 
  account.userName = account.owner
  .toLowerCase()
  .split(" ")
  .map((str)=>str[0])
  .join("")
  )}

//////////////////////////////////////////////////////////////
//this func will show and add the balance
const calcAndDisplayBalance = (account)=>{
  
  account.balance = account.movements.reduce((acc,mov) => acc+mov,0).toFixed(2);
  const formattedNumber=intlCurrency(account,account.balance)
  labelBalance.textContent=`${formattedNumber}`;
}

//////////////////////////////////////////////////////////////
//this function will display the input and output and interest total of the account
const calcAndDisplaySummary= (account)=>{
  //calculate and display incomes
  const incomes=account.movements.filter(mov=> mov > 0)
  .reduce((acc,mov,i,arr) => acc+mov,0).toFixed(2);
  labelSumIn.textContent=`${intlCurrency(account,incomes)}`;

  //calculate and display outcomes
  const outcomes=account.movements.filter(mov=> mov < 0)
  .reduce((acc,mov,i,arr) => acc+mov,0).toFixed(2);
  labelSumOut.textContent=`${intlCurrency(account,outcomes)}`;

  //calculate and display interests
  const interests=account.movements.filter(deposit=> deposit > 0)
  .map(deposit => deposit*account.interestRate/100)
  .filter(deposit=> deposit >= 1)
  .reduce((acc,deposit) => acc+deposit,0)
  .toFixed(2)
  labelSumInterest.textContent=`${intlCurrency(account,interests)}`;
}

//////////////////////////////////////////////////////////////
//updating the UI
const updateUi= (currentUser)=>{
  //display movements
displayMovements(currentUser); 
//display balance
calcAndDisplayBalance(currentUser);
//displaysummary
calcAndDisplaySummary(currentUser)
}

///////////////////////////////////////////////////////////////
//create username before enabling login
createUserName(accounts);
//the seetion userName
let currentUser;
///////////////////////////////////////////////////////////////

//event handlers
//////////////////////////////////////////////////////////////
//handling login form

btnLogin.addEventListener("click",(e)=>{
e.preventDefault();

currentUser= accounts.find(user => user.userName ===inputLoginUsername.value);

if (+inputLoginPin.value === currentUser.pin) {
//display Welcome message
labelWelcome.textContent=`Welcome back, ${currentUser.owner.split(" ")[0]}`;

//setting the date lable

//const locale = navigator.language;
const now= new Date();
const options={
hour:`numeric`,
minutes:`numeric`,
day:`numeric`,
month:`long`,
year:`numeric`,
}
labelDate.textContent=`${new Intl.DateTimeFormat(currentUser.locale,options).format(now)}`

//clear input feilds
inputLoginUsername.value= inputLoginPin.value=``;
inputLoginPin.blur();

//display UI
containerApp.style.opacity=100;

//updating UI
updateUi(currentUser);
}}) 
//////////////////////////////////////////////////////////////

//handling transfer form
btnTransfer.addEventListener("click",(e)=>{
  e.preventDefault();
  //the money amount
  const amount=+inputTransferAmount.value;
  //the recever account
  const transferee= accounts.find(account => 
  account.userName===inputTransferTo.value);
  //clear input values
  inputTransferTo.value=inputTransferAmount.value=``;
  //check the trnsfer amount is enough and is positive value
  if (amount > 0 &&
      amount <= currentUser.balance &&
      transferee.userName!== currentUser.userName&&
      transferee.userName) {
      //deduct from the current user
      currentUser.movements.push(-amount);
     //add amount to the recever
     transferee.movements.push(amount);

      //add the date to the current user
      currentUser.movementsDates.push(new Date().toISOString());
     //add the date to to the recever
     transferee.movementsDates.push(new Date().toISOString());
     //updating UI
     updateUi(currentUser);
}});

//////////////////////////////////////////////////////////////

////handling loan form;
btnLoan.addEventListener("click",(e)=>{
  e.preventDefault();
  //getting input values
  const loanAmount=+inputLoanAmount.value;

  //checking input validity
  // if the 10% of the requested loan is les or equal to any deposet 
  if (loanAmount>0&&
    currentUser.movements.some(mov =>
    mov >= loanAmount*0.1)) {
    //add the request loan amount
    currentUser.movements.push(loanAmount);

     //add the date to the current user
     currentUser.movementsDates.push(new Date().toISOString());
     //add the date to to the recever
     transferee.movementsDates.push(new Date().toISOString());

    //update the UI
    updateUi(currentUser);
  }
  inputLoanAmount.value=``;
})

//////////////////////////////////////////////////////////////

////handling close account form;
btnClose.addEventListener("click",(e)=>{
  e.preventDefault();
  //getting input values
 const userNameInput=inputCloseUsername.value
 const pinInput= +inputClosePin.value.toFixed(2);
//checking input validity
  if (userNameInput=== currentUser.userName&&pinInput===currentUser.pin) {
    //getting the index of the account in the accounts array
    const index=accounts.findIndex
    (account=> account.userName===userNameInput);
    //removing the account
    accounts.splice(index,1);
    //hide UI
    containerApp.style.opacity=0;
  }});

//////////////////////////////////////////////////////////////
////handling sort button;
let sorted=false
btnSort.addEventListener("click",(e)=> {
  e.preventDefault();

  displayMovements(currentUser,!sorted);

  sorted=!sorted; 
});

////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////

/* const deposits = movements.filter(mov=> mov > 0);
const withdrals = movements.filter(mov=> mov < 0); */
/////////////////////////////////////////////////
/////////////////////////////////////////////////
