import {
  IOfflineEntity,
  LocalStorageProvider,
  OfflineStorage,
} from '../src/index';

class User implements IOfflineEntity {
    id: string;
    created: number;
    lastModified: number;
    name: string;
    age: number;
    constructor(name: string, age: number) {
        this.id = crypto.randomUUID();
        this.created = Date.now();
        this.lastModified = Date.now();
        this.name = name;
        this.age = age;
    }
}

export class TestClint {
    constructor() {


       const provider = new LocalStorageProvider();
        //const provider = new IndexedDBProvider

        const storage = new OfflineStorage(provider, 'testStorage');
        storage.init().then(async () => {
            console.log('storage initialized');
            const users = storage.getModel<User>('users');
            console.log('users', await users.find((user: User) => user.age === 1));

            const arrayOfUsers = await storage.getModel<User>('users').toArray();
            
            console.log("QueryableArray results",arrayOfUsers.skip(2).take(3).firstOrDefault());



            const user = await users.get(0);
            console.log('first user', user);

           

          
        
            users.toArray().then((users) => {
                users.forEach((user) => {
                    console.log('user', user);  
                });
            });

            //  const user = new User('John Doe', 100);
            //  await storage.insert("users",user);

        }
        ).catch((error) => {
            console.log('error', error);
            storage.addModel('users');
            storage.save();
        }
        );



        // if(!storage.getModel('users')){
        //     storage.addModel('users');      
        // }

        //  const user = new User('John Doe', 25);
        //  storage.insert("users",user);

        //  storage.save();

    }

    async test() {

        return true;

    }
}

document.addEventListener('DOMContentLoaded', () => {

    const testApp = new TestClint()

    testApp.test();



});