

jolly-donny  is a TypeScript library that provides a flexible and powerful way to manage data in offline environments. It supports multiple storage providers (e.g., LocalStorage, IndexedDB) and offers a LINQ-like query API for data manipulation.

## Features

-   **Multiple Storage Providers:** Supports LocalStorage and IndexedDB, with the ability to extend to other storage solutions.
-   **LINQ-like Query API:** Provides a rich set of query methods for filtering, sorting, and transforming data.
-   **Asynchronous Operations:** All storage and query operations are asynchronous, ensuring non-blocking execution.
-   **Change Tracking:** Notifies subscribers of data changes (insert, update, delete, save).
-   **Custom QueryableArray:** Provides a chainable and powerful array-like structure for data manipulation.

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


```typescript 
4. Using QueryableArray

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

