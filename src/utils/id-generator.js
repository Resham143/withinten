const Store = require('../models/store.model');
const Owner = require('../models/owner.model');

class IdGenerator {
  static generateRandomId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async generateUniqueStoreId() {
    let storeId;
    let isUnique = false;
    
    while (!isUnique) {
      storeId = 'S' + this.generateRandomId(7);
      
      const existingStore = await Store.findOne({
        where: { store_id: storeId }
      });
      
      if (!existingStore) {
        isUnique = true;
      }
    }
    
    return storeId;
  }

  static async generateUniqueOwnerId() {
    let ownerId;
    let isUnique = false;
    
    while (!isUnique) {
      ownerId = 'O' + this.generateRandomId(7);
      
      const existingOwner = await Owner.findOne({
        where: { owner_id: ownerId }
      });
      
      if (!existingOwner) {
        isUnique = true;
      }
    }
    
    return ownerId;
  }
}

module.exports = IdGenerator; 