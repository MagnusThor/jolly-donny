This library provides a robust and flexible offline storage solution for JavaScript applications. It abstracts away the complexities of different storage mechanisms (like LocalStorage and IndexedDB), allowing developers to interact with data models in a consistent and intuitive way. Key features include:

* **Model-Based Data Management:** Define your data models as classes, enabling strong typing and object-oriented programming.
* **Customizable Data Formatting:** Use formatters to transform data during storage and retrieval, handling data type conversions and transformations seamlessly.
* **Abstraction of Storage Providers:** Easily switch between different storage providers (LocalStorage, IndexedDB, etc.) without modifying your data model or application logic.
* **Queryable Data Collections:** Use a `QueryableArray` to perform advanced queries and manipulations on your data collections.
* **Efficient Data Synchronization:** Provides tools and patterns to keep local data in sync with remote servers.
* **Error Handling and Robustness:** Includes comprehensive error handling and logging to ensure data integrity and application stability.


## Installation


TBD


## Usage


1. Initialize OfflineStorage

```typescript 
import { OfflineStorage, IndexedDBProvider, EntityBase } from 'your-package-name';

class User extends EntityBase {
    constructor(public name: string, public age: number) {
        super();
    }
}

const provider = new IndexedDBProvider();
//const provider =new  LocalStorageProvider()

const storage = new OfflineStorage(provider, 'userStorage');

async function initStorage() {
    await storage.init();
    console.log('Storage initialized');
}

initStorage();

```

2. Add and Retrieve Data



```typescript 
async function addAndRetrieveUsers() {
    const users = storage.getModel<User>('users');

    const newUser = new User('John Doe', 25);
    await users.insert(newUser);

    const allUsers = await users.all();
    console.log('All users:', allUsers);

    const filteredUsers = await users.find(user => user.age > 25);
    console.log('Filtered users:', filteredUsers);

    const firstUser = await users.first();
    console.log('First user:', firstUser);
}

addAndRetrieveUsers();


```

3. Update and Delete Data



```typescript 

async function updateAndDeleteUsers() {
    const users = storage.getModel<User>('users');

    const firstUser = await users.first();
    if (firstUser) {
        firstUser.age = 35;
        await users.update(firstUser);
        console.log('User updated:', firstUser);

        await users.delete(firstUser);
        console.log('User deleted:', firstUser);
    }
}

updateAndDeleteUsers();


```
 

4. Using QueryableArray

```typescript 

async function useQueryableArray() {
    const users = storage.getModel<User>('users');

    const usersArray = await users.all();
    const filteredUsers = usersArray
        .where(user => user.age > 20)
        .orderBy(user => user.name)
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

async function insertUserWithChangeTracking() {
    const users = storage.getModel<User>('users');
    const newUser = new User('Jane Smith', 25);
    await users.insert(newUser);
}

insertUserWithChangeTracking();

```

