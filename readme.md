# Offline Storage Library

 A TypeScript library for powerful offline data management. Supports pluggable storage providers (LocalStorage, IndexedDB, SQLite via WASM), LINQ-style query API, async CRUD operations, change tracking, and enhanced QueryableArray utilities.

✨ Features

 - Generic Collections – Create type-safe collections for structured
   data management.  
   
  - CRUD Operations – Perform standard Create, Read, Update, and Delete actions with ease.
     
   
   - Flexible Querying – Use intuitive query functions to filter and
   transform data.
   
   
   
   - Asynchronous Execution – All operations are async to keep your app
   responsive and non-blocking.
   
   
   - Pluggable Storage Providers – Works with various backends:
   LocalStorage, IndexedDB, File System API, and SQLite (WASM).
   
   
   - Data Synchronization – Easily sync local data with remote APIs using
   built-in helpers.
   
     - Transformable Fetch – Fetch method supports optional transformation logic or returns raw JSON.
   
   
   - Timeout & Cancellation Support – Use AbortController to handle
   request timeouts and cancellations.
   
   
   - Built with TypeScript – Enjoy full type safety and enhanced developer  tooling.
   
      Easily Extensible – Add your own custom storage providers or
   extend existing features effortlessly.

  

## Installation

  

```bash

npm  i  jolly-donny

```

  

## Usage

  
  

1. Initialize OfflineStorage

  

```typescript

import { OfflineStorage, IndexedDBProvider,LocalStorageProvider, PersistedEntity } from  'your-package-name';

  

class  User  extends  PersistedEntity<User> {

constructor(public  name: string, public  age: number) {

super();

}

}

  

const  provider = new  IndexedDBProvider();

// const provider = new LocalStorageProvider();

  

const  storage = new  OfflineStorage(provider, 'userStorage');

  

async  function  initStorage() {

await  storage.init();

console.log('Storage initialized');

}

  

initStorage();

  

```

  
  

2. Add and Retrieve Data

  
  
  

```typescript

  

async  function  addAndRetrieveUsers() {

const  users = storage.getCollection<User>('users');

  

const  newUser = new  User('John Doe', 25);

await  users.insert(newUser);

  

const  allUsers = await  users.all();

console.log('All users:', allUsers);

  

const  filteredUsers = await  users.find(user  =>  user.age > 25);

console.log('Filtered users:', filteredUsers);

  

const  firstUser = await  users.first();

console.log('First user:', firstUser);

}

  

addAndRetrieveUsers();

  
  

```

  

3. Update and Delete Data

  
  
  

```typescript

  

async  function  updateAndDeleteUsers() {

const  users = storage.getCollection<User>('users');

  

const  firstUser = await  users.first();

if (firstUser) {

firstUser.age = 35;

await  users.update(firstUser);

console.log('User updated:', firstUser);

  

await  users.delete(firstUser);

console.log('User deleted:', firstUser);

}

}

  

updateAndDeleteUsers();

  

```

  

4. Using QueryableArray

  
  
  

```typescript

  

async  function  useQueryableArray() {

const  users = storage.getCollection<User>('users');

  

const  usersArray = await  users.all();

const  filteredUsers = usersArray

.where(user  =>  user.age > 20)

.orderBy(user  =>  user.name)

.take(5);

  

console.log('Filtered and ordered users:', filteredUsers);

}

  

useQueryableArray();

  

```

  

5. Change Tracking

  
  

```typescript

  

storage.onChange = (change) => {

console.log('Data changed:', change);

};

  

async  function  insertUserWithChangeTracking() {

const  users = storage.getCollection<User>('users');

const  newUser = new  User('Jane Smith', 25);

await  users.insert(newUser);

}

  

insertUserWithChangeTracking();

  

```

  
  

6. Using the fetch Helper for Data Synchronization

  
  

```typescript

interface  IMenu {

dishes: IDish[];

categories: ICategory[];

}

  

interface  IDish {

id: number;

category: number;

title: string;

priceString: string;

sku: number;

description: string;

uuid: string;

showInLimited: boolean;

}

  

interface  ICategory {

id: number;

name: string;

}

  

class  ExtendedDish {

id: number;

category: number;

title: string;

priceString: string;

sku: number;

description: string;

uuid: string;

showInLimited: boolean;

categoryName: string;

  

get  price(): number {

const  parsedPrice = parseFloat(this.priceString);

return  isNaN(parsedPrice) ? 0 : parsedPrice;

}

  

set  price(value: number) {

this.priceString = value.toFixed(2);

}

}

  

async  function  syncAndStoreDishes() {

try {

const  extendedDishes = await  OfflineStorage.fetch<IMenu, ExtendedDish[]>('fake-api/data.json', (result) => {

const  dishes = result.dishes.map((dish) => {

const  category = result.categories.find((cat) =>  cat.id === dish.category);

const  extendedDish = new  ExtendedDish();

Object.assign(extendedDish, dish);

extendedDish.categoryName = category ? category.name : 'Unknown';

return  extendedDish;

});

return  dishes;

});

  

for (const  dish  of  extendedDishes) {

const  existingDish = await  storage.getCollection<ExtendedDish>('dishStorage').find((d) =>  d.uuid === dish.uuid);

if (!existingDish || existingDish.length === 0) {

await  storage.getCollection<ExtendedDish>('dishStorage').insert(dish);

}

}

  

const  storedDishes = await  storage.getCollection<ExtendedDish>('dishStorage').all();

console.log('Stored dishes:', storedDishes);

} catch (error) {

console.error('Synchronization failed:', error);

}

}

  

syncAndStoreDishes();

  

```

  

7.  **Using Formatters with PersistedEntityBuilder**

  

```typescript

import { PersistedEntity, PersistedEntityBuilder, IFormatter } from  'your-package-name';

  

class  CustomStringFormater  implements  IFormatter<string> {

format(value: string): string {

return  value.toLowerCase(); // always store the value in lower case

}

parse(value: string): string {

return  value.toUpperCase(); // always return the value in upper case

}

}

  

class  CustomDateFormater  implements  IFormatter<Date | null> {

format(value: Date | null): Date | null {

// Store the Date object as is

return  value;

}

parse(value: Date | null): Date | null {

if (!value) {

return  null;

}

value.setHours(0, 0, 0, 0); // set the time to 00:00:00.000

return  value;

}

}

  

class  User  extends  PersistedEntity<User> {

id: string;

created: number;

lastModified: number;

name: string;

age: number;

birthDate: Date | null = null;

  

constructor(name: string, age: number) {

super(new  PersistedEntityBuilder<User>()

.addFormatter('name', new  CustomStringFormater())

.addFormatter('birthDate', new  CustomDateFormater())

);

  

this.id = crypto.randomUUID();

this.created = Date.now();

this.lastModified = Date.now();

this.name = name;

this.age = age;

this.birthDate = new  Date();

}

}

  

// Example usage:

async  function  exampleFormatters() {

const  users = storage.getCollection<User>('users');

const  newUser = new  User('Example User', 30);

await  users.insert(newUser);

  

const  allUsers = await  users.all();

console.log('Users with formatters:', allUsers);

}

  

exampleFormatters();

  

```

  

8. Using the FileSystemProvider for File-Based Storage

The FileSystemProvider enables storing and loading collections using the File System Access API (in supported browsers).

  
  
  

```typescript

import {

FileSystemProvider,

OfflineStorage,

IProviderConfig,

} from  'jolly-donny';

import { IMenu } from  './types'; // Your data interfaces

  

// Optional: define a parser to extract collections from a loaded file

const  dishFileParser = (content: string): Map<string, any> => {

const  parsed: IMenu = JSON.parse(content);

const  collections = new  Map<string, any>();

if (Array.isArray(parsed.dishes)) collections.set('dishes', parsed.dishes);

if (Array.isArray(parsed.categories)) collections.set('categories', parsed.categories);

return  collections;

};

  

async  function  useFileSystemProvider() {

const  providerConfig: IProviderConfig = {

parser:  dishFileParser,

};

  

const  provider = new  FileSystemProvider(providerConfig);

const  storage = new  OfflineStorage(provider, 'menu');

await  storage.init();

  

const  dishes = await  storage.getCollection('dishes').all();

console.log('Loaded dishes from file:', dishes);

  

// Modify and save

if (dishes.length > 0) {

dishes[0].price = 99;

await  storage.update('dishes', dishes[0]);

await  storage.save(); // Save back to file

}

}

```

  

Note: The File System API is available in Chromium-based browsers like Chrome and Edge. When init() is called, the user will be prompted to select a file.

  

9. Using the SQLiteSchemeProvider

This example demonstrates how to use the SQLiteSchemeProvider for storing and retrieving data in an SQLite database.

  

```typescript

  

import { SQLiteSchemeProvider } from  'jolly-donny';

  

// Create a new instance of the SQLiteProvider

const  provider = new  SQLiteSchemeProvider();

  

// Initialize the provider with a storage name

provider.init('notes-db').then(async () => {

  

console.log('SQLiteProvider initialized');

  

// Create a new note object

const  newNote = { title:  'First Note', content:  'This is the content of the first note.' };

  

// Insert the note into the database

await  provider.update('notes', newNote);

  

// Retrieve all notes from the database

const  allNotes = await  provider.all('notes');

console.log('All notes:', allNotes);

}).catch((error) => {

console.error('Error initializing SQLite provider:', error);

});

  

```