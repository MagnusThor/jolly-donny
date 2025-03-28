This library provides a robust and flexible offline storage solution for JavaScript applications. It abstracts away the complexities of different storage mechanisms (like LocalStorage and IndexedDB), allowing developers to interact with data collections in a consistent and intuitive way. Key features include:

* **Collection-Based Data Management:** Define your data collections as classes that extend `PersistedEntity`, enabling strong typing and object-oriented programming.
* **Customizable Data Formatting:** Use formatters to transform data during storage and retrieval, handling data type conversions and transformations seamlessly.
* **Abstraction of Storage Providers:** Easily switch between different storage providers (LocalStorage, IndexedDB, etc.) without modifying your data collection or application logic.
* **Queryable Data Collections:** Use a `QueryableArray` to perform advanced queries and manipulations on your data collections.
* **Efficient Data Synchronization:** Provides tools and patterns to keep local data in sync with remote servers.
* **Error Handling and Robustness:** Includes comprehensive error handling and logging to ensure data integrity and application stability.
* **Simplified Entity Configuration:** Use `PersistedEntityBuilder` to easily define formatters for your persisted entities.


## Installation


TBD


## Usage


1. Initialize OfflineStorage

 ```typescript
    import { OfflineStorage, IndexedDBProvider, PersistedEntity } from 'your-package-name';

    class User extends PersistedEntity<User> {
        constructor(public name: string, public age: number) {
            super();
        }
    }

    const provider = new IndexedDBProvider();
    // const provider = new LocalStorageProvider();

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
        const users = storage.getCollection<User>('users');

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
        const users = storage.getCollection<User>('users');

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
        const users = storage.getCollection<User>('users');

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
        const users = storage.getCollection<User>('users');
        const newUser = new User('Jane Smith', 25);
        await users.insert(newUser);
    }

    insertUserWithChangeTracking();

```


6.  **Using Formatters with PersistedEntityBuilder**

 ```typescript
    import { PersistedEntity, PersistedEntityBuilder, IFormatter } from 'your-package-name';

    class CustomStringFormater implements IFormatter<string> {
        format(value: string): string {
            return value.toLowerCase(); // always store the value in lower case
        }
        parse(value: string): string {
            return value.toUpperCase(); // always return the value in upper case
        }
    }

    class CustomDateFormater implements IFormatter<Date | null> {
        format(value: Date | null): Date | null {
            // Store the Date object as is
            return value;
        }
        parse(value: Date | null): Date | null {
            if (!value) {
                return null;
            }
            value.setHours(0, 0, 0, 0); // set the time to 00:00:00.000
            return value;
        }
    }

    class User extends PersistedEntity<User> {
        id: string;
        created: number;
        lastModified: number;
        name: string;
        age: number;
        birthDate: Date | null = null;

        constructor(name: string, age: number) {
            super(new PersistedEntityBuilder<User>()
                .addFormatter('name', new CustomStringFormater())
                .addFormatter('birthDate', new CustomDateFormater())
            );

            this.id = crypto.randomUUID();
            this.created = Date.now();
            this.lastModified = Date.now();
            this.name = name;
            this.age = age;
            this.birthDate = new Date();
        }
    }

    // Example usage:
    async function exampleFormatters() {
        const users = storage.getCollection<User>('users');
        const newUser = new User('Example User', 30);
        await users.insert(newUser);

        const allUsers = await users.all();
        console.log('Users with formatters:', allUsers);
    }

    exampleFormatters();

```
