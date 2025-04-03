# Offline Storage Library

A lightweight and flexible offline storage library for JavaScript applications.

## Features

* **Generic Collections:** Create type-safe collections for your data.
* **CRUD Operations:** Perform standard Create, Read, Update, and Delete operations.
* **Querying:** Find data using flexible query functions.
* **Asynchronous Operations:** All operations are asynchronous, ensuring non-blocking execution.
* **Flexible Storage Providers:** Supports various storage providers (e.g., IndexedDB, LocalStorage).
* **Data Synchronization:** Includes a helper function for easy data synchronization with remote APIs.
    * **Optional Transformation:** The `fetch` method allows for optional data transformations, or simply retrieving raw JSON.
    * **Timeout & Cancellation:** The `fetch` method supports request timeouts and cancellation using `AbortController`.
* **Type Safety:** Built with TypeScript for enhanced type safety and developer experience.
* **Extensible:** Designed to be easily extended with custom storage providers and features.


## Installation


```bash 
npm i jolly-donny
```

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


6. Using the fetch Helper for Data Synchronization


 ```typescript
interface IMenu {
  dishes: IDish[];
  categories: ICategory[];
}

interface IDish {
  id: number;
  category: number;
  title: string;
  priceString: string;
  sku: number;
  description: string;
  uuid: string;
  showInLimited: boolean;
}

interface ICategory {
  id: number;
  name: string;
}

class ExtendedDish {
  id: number;
  category: number;
  title: string;
  priceString: string;
  sku: number;
  description: string;
  uuid: string;
  showInLimited: boolean;
  categoryName: string;

  get price(): number {
    const parsedPrice = parseFloat(this.priceString);
    return isNaN(parsedPrice) ? 0 : parsedPrice;
  }

  set price(value: number) {
    this.priceString = value.toFixed(2);
  }
}

async function syncAndStoreDishes() {
  try {
    const extendedDishes = await OfflineStorage.fetch<IMenu, ExtendedDish[]>('fake-api/data.json', (result) => {
      const dishes = result.dishes.map((dish) => {
        const category = result.categories.find((cat) => cat.id === dish.category);
        const extendedDish = new ExtendedDish();
        Object.assign(extendedDish, dish);
        extendedDish.categoryName = category ? category.name : 'Unknown';
        return extendedDish;
      });
      return dishes;
    });

    for (const dish of extendedDishes) {
      const existingDish = await storage.getCollection<ExtendedDish>('dishStorage').find((d) => d.uuid === dish.uuid);
      if (!existingDish || existingDish.length === 0) {
        await storage.getCollection<ExtendedDish>('dishStorage').insert(dish);
      }
    }

    const storedDishes = await storage.getCollection<ExtendedDish>('dishStorage').all();
    console.log('Stored dishes:', storedDishes);
  } catch (error) {
    console.error('Synchronization failed:', error);
  }
}

syncAndStoreDishes();

 ```

7.  **Using Formatters with PersistedEntityBuilder**

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
