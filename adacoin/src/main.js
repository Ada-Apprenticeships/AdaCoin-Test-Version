const SHA256 = require('crypto-js/sha256'); // looks in the node_modules folder for the library
const { v4: uuidv4 } = require('uuid'); // for details review https://www.npmjs.com/package/uuid


class TS {
  // class used to provide a range of methods and properties designed to help meet the app's timestamp requirements
  #now; // declare a private class variable, used to store the current system time
  constructor() { // constructors are automatically executed when the class object is instantiated
    this.#now = new Date(); // create a date object based on the current system time 
  }

  //property (rather than method) return today's date in ISO format (month requires +1 as 'jan' starts with 0 otherwise)
  get today() { return [ this.#now.getFullYear(), (this.#now.getMonth() + 1), this.#now.getDate() ].join('-'); }
  
  isdatevalid(isodate) { // return true or false depending on whether the passed iso date is a valid date
    if (isNaN(Date.parse(isodate))) { return false };
    return true; //if passed date can't be parsed (convered to a number) then its not a valid date 
  }
  
  dayssince(isodate) {
    //returns an error or the number of days between the isodate and 'today'; negative values are in the future
    try { this.isdatevalid(isodate); } // try and catch
    catch(e) { throw new Error('Invalid Date'); } // throw immediately returns so no need to return 
    
    let ms = new Date(this.today) - new Date(isodate); //milliseconds (ms) elapsed between dates
    return (((ms / 1000) / 60) / 60) / 24 ; //ms -> seconds -> mins -> hours -> days; returns difference as days
  }
  
}


const isvalidcurrency = (value) => { // example arrow function 
  // returns true or false based on the value provided in the format dd.dd
  // {n} = example n instances
  // * = 0 or more instances
  // + = 1 or more instances
  // ? = 0 or 1 instance
  // \ = escape following character
  // \d = digit
  // https://cheatography.com/davechild/cheat-sheets/regular-expressions/  
  // let regex_numberpattern = /^[+-]?\d+(\.\d+)?$/; //signed, digits (1 or more), decimal point multiple digits
  let regex_numberpattern = /^\d+\.\d{2}$/; // unsigned, digits (1 or more), decimal point multiple digits 
  if(regex_numberpattern.test( value )) return true; // if the format is as expected
  return false; // unexpected format
}


class Block { // blocks are used to support account transactions, chains contain multiple blocks
  constructor(ts, transaction) { // constructors are automatically executed when the class object is instantiated  
    this.ts = ts; // indicates the time stamp when the block was created
    this.transaction = transaction; // holds information to be stored, e.g. details of transaction, how much money transferred, sender, recipient
    this.p_hash = 0; // holds the hash value of the 'previous' block; essential to ensure integrity, initialise as 0
    
    // we also need to include a hash for this block
    this.hash = this.calculatehash(); // lets automatically execute our calculate hash function and store the result
  }

  calculatehash() { // returns a calculated hash based on the stored values
    return SHA256( this.ts + JSON.stringify(this.transaction) + this.phash ).toString(); // return a string rather than an object
  }

  get phash() { return this.p_hash; } // fyi, 'getters (get)' creates a property rather than a function, meaning we dont need to include round brakets 
  set phash(hash) { this.p_hash = hash; } // fyi, 'setters (set)' creates a property rather than a function, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
  
  get tid() { // return the tid - fyi, 'get' creates a property rather than a function, meaning we dont need to include round brakets 
    return this.transaction.tid;
  }
  
  get creditvalue() { // return the credit value property
    if(this.transaction.credit === undefined) return 0; // if not available return 0
    return Number(this.transaction.credit); // return a numeric value for the transaction
  }

  get debitvalue() { // return the debit value property
    if(this.transaction.debit === undefined) return 0; // if not available return 0
    return Number(this.transaction.debit); // return a numeric value for the transaction
  }
  
  validtimestamp() { // check the timestamp's valid status
    let ts = new TS(); // create a new instance of the timestamp object from the class
    if(!ts.isdatevalid(this.ts)) return false; // is the timestamp in a valid format
    if(ts.dayssince(this.ts) < 0) return false; // is the timestamp range valid (future is negative)
    if(ts.dayssince(this.ts) > 180) return false; // is the timestamp range valid (past is positive)
    return true;
  }

  validtransaction() {
    // check transaction has either a valid credit or debit property value and includes an id 
    if(!(this.transaction.hasOwnProperty('tid'))) { // do we have a transaction id property
      throw new Error('TID Error: ' + this.transaction.tid); // throw immediately returns so no need to return 
    }

    if(!(this.transaction.hasOwnProperty('credit') || this.transaction.hasOwnProperty('debit')) ){ // do we have an expected property  
      throw new Error('Type Error: ' + this.transaction.tid); // throw immediately returns so no need to return 
    }

    if(this.transaction.hasOwnProperty('credit')) { // if we have a credit property      
      if(!(isvalidcurrency(this.transaction.credit))) { // if so, do we have valid currency value (n.nn)
        throw new Error('Credit Error: ' + this.transaction.tid); // throw immediately returns so no need to return 
      } 
    }

    if(this.transaction.hasOwnProperty('debit')) { // if we have a debit property      
      if(!(isvalidcurrency(this.transaction.debit))) { // if so, do we have valid currency value (n.nn)
        throw new Error('Debit Error: ' + this.transaction.tid); // throw immediately returns so no need to return 
      } 
    }

    return true; // return a default true state, if we get here we should be good to go
  }  
}




class Chain { // chains are used to hold blocks; blocks are used to support account transactions
  constructor() {
    this.chain = [ this.genesisblock() ]; 
  }

  genesisblock() { // returns a new genesis block, the required starting block
    return new Block('1/1/1970', 'Genesis Block'); //ts, data
  }

  lastblock() { // gets the length of the chain and uses that to return the last block (object)
    return this.chain[this.chain.length - 1];
  }

  balance() { // returns the total balance held in the chain
    // we need to iterated through the entire chain and incorporate the values of each transaction
    let credit = 0, debit = 0; //initialise default credit and debit values
    for( const b of this.chain ) { // lets iterate through the entire chain don'f forget all invalid values return 0
      credit += b.creditvalue; // update the running credit value
      debit += b.debitvalue; // update the running debit value 
    }
    //prepare a formatted uk currency value
    let amount = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(credit - debit);  
    return amount; // return a formatted uk currency value
  }

  rebuild() { //iterate through the chain rebuilding the hashs so that the chain is valid
  }
  
  addblock(newblock) { // returns true or false depending on whether the block was added; additional blocks should be fully verified as valid
    if(!this.isvalid()) { // is the current chain valid (blocks are all correctly aligned)
      return false; 
    }

    try { newblock.validtransaction(); } // is the block's timestamp valid (iso format)
    catch(e) {
      return false;
    }

    try { newblock.validtimestamp(); } // is the block's timestamp valid (iso format)
    catch(e) {
      return false;
    }
    
    newblock.phash = this.lastblock().hash; // record the previous block hash in the new block (helps secure the chain's integrity)
    newblock.hash = newblock.calculatehash(); // calculate the hash value for the newblock (helping secure data integrity)

    // push the new block in to the chain - not normally this simple in 'real-life' blockchain
    if ((this.chain.length + 1) !== this.chain.push( newblock )) { // 'push' returns the update length
      throw new Error('Chain Error: ' + this.transaction.tid); 
    }

    console.log(`block (${newblock.tid} added`);
    return true; // block has been added to the chain      
  }

  isvalid() {
    // returns true or false depending on whether the entire chain is valid
    for( let b = 1; b < this.chain.length; b++ ) { // lets iterate through the entire chain (not including the genesis (0) block)
      const current = this.chain[ b ]; // the current block being iterated
      const previous = this.chain[ b - 1 ]; // the previous iterated block

      // check stored hash against a calculated version; should be the same if no change       
      if( current.hash !== current.calculatehash() ) { // are they different?
        return false; // if the stored and calculated hashes are different, the transaction has been altered
      }

      // check the stored previous hash with the actual previous hash
      if( current.phash !== previous.hash ) { // are they a match?
        return false; // if the previously stored hash and actual previous hash are different, the link has been altered
      }      
    }
    
    // if we are here, we've iterated through the entire chain and all good
    return true;
  }
  
}




// let _ts = new TS();
// console.log('testing ts isdatevalid: ' + _ts.isdatevalid('2022-11-01'))
// console.log('testing ts dayssince: ' + _ts.dayssince('2022-07-01'))
// console.log('testing isvalidcurrency: ' + isvalidcurrency('20.20'))


// let _block = new Block( '2022-7-1', { credit: '25.504', tid: uuidv4() }); // create a new block instance
// console.log(`block ts: ${ _block.ts }`);
// console.log(`block tid: ${ _block.tid }`);
// console.log(`block debit value: ${ _block.debitvalue }`);
// console.log(`block credit value: ${ _block.creditvalue }`);


// let _account1 = new Chain (); // create a new chain instance
// try { _account1.addblock( new Block( '2022-7-1', { credit: '25.50', tid: uuidv4() }) ) } // add credit transaction
// catch (e) { console.log(`failed to add block: ${e.message}`) }

// try { _account1.addblock( new Block( '2022-7-1', { credit: '15.50', tid: uuidv4() }) ) } // add credit transaction
// catch (e) { console.log(`failed to add block: ${e.message}`) }

// console.log(`account balance: ${_account1.balance()}`);


module.exports = { TS, isvalidcurrency, Block, Chain }; // expose (export) the selected functions and classes