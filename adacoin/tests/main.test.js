const main = require('../src/main.js'); 


describe('1. Basic TS Smoke Tests', () => {
  let _ts = new main.TS(); // create an instance of the TS class
  test("1.1 TS Class Defined", () => {
    expect (_ts).toBeInstanceOf(main.TS); // confirm instance is actually an instance of TS 
    expect( typeof(main.TS) ).toBe('function');
  });
  
  test("1.2 TS Class 'isdatevalid' method", () => {
    expect( typeof(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(_ts), 'isdatevalid').value) ).toBe('function'); // test method
  });
  
  test("1.3 TS Class 'today' property", () => {
    expect( typeof(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(_ts), 'today').get) ).toBe('function'); // test property 
  });

  test("1.4 TS Class 'dayssince' method", () => {
    expect( typeof(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(_ts), 'dayssince').value) ).toBe('function'); // test method
  });
  
});


describe('2. Basic IsValidCurrency Smoke Tests', () => {
  test("2.1 TS IsValidCurrency Function Defined", () => {
    expect( typeof(main.isvalidcurrency) ).toBe('function'); // confirm typeof value is a function 
  });

});


//Some possible considerations
//unit testing - positive & negative, reliability and robustness
//integration testing - classes (positive & negative, reliability and robustness)
//scenario testing - user A wants to transfer an amount to user B


describe('n. Scenario 1 - User Crediting Account', () => {

  let _user1 = new main.Chain (); // create a new chain instance 
  
  test("n.1 Adding Credit Values", () => {
    _user1.addblock( new main.Block( '2022-7-1', { credit: '0.50', tid: 'transaction1' }) ) ;
     expect( _user1.balance() ).toBe('£0.50'); 
  });

});