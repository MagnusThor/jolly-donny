import { IPersistedEntity } from '../interface/IPersistedEntity ';

/**
 * Represents the base class for entities, providing common properties and functionality
 * for offline entities.
 *
 * @implements {IPersistedEntity }
 */
export class PersistedEntityBase implements IPersistedEntity  {
    id: string;
    created: number;
    lastModified: number;

    constructor() {
        this.id = crypto.randomUUID(); 
        this.created = Date.now();
        this.lastModified = Date.now();
    }

  
}
