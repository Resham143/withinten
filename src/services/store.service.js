const jwt = require('jsonwebtoken');
const Store = require('../models/store.model');
const StoreUser = require('../models/store-user.model');
const redisClient = require('../config/redis');
const IdGenerator = require('../utils/id-generator');
const sequelize = require('../config/database');
const StoreDetail = require('../models/store-detail.model');
const Owner = require('../models/owner.model');
const OwnerLogin = require('../models/owner_login.model');
const StoreOpenClose = require('../models/store-open-close.model');
const { Op } = require('sequelize');
class StoreService {
  async register(storeData, token) {
    // Verify token and get owner details
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }

    // Validate token is active in owner_login
    const activeLogin = await OwnerLogin.findOne({
      where: {
        owner_id: decodedToken.owner_id,
        token: token,
        is_active: true
      }
    });

    if (!activeLogin) {
      throw new Error('Invalid or expired session');
    }

    // Verify owner_id from token matches request
    if (decodedToken.owner_id !== storeData.owner_id) {
      throw new Error('Unauthorized: Owner ID mismatch');
    }

    // Validate required fields
    const requiredFields = ['store_name', 'owner_id'];

    for (const field of requiredFields) {
      if (!storeData[field]) {
        throw new Error(`${field.replace('_', ' ')} is required`);
      }

      if (typeof storeData[field] !== 'string') {
        throw new Error(`${field.replace('_', ' ')} must be a string`);
      }

      if (storeData[field].trim().length === 0) {
        throw new Error(`${field.replace('_', ' ')} cannot be empty`);
      }
    }

    // Validate owner exists and is active
    const owner = await Owner.findOne({
      where: {
        owner_id: storeData.owner_id,
        is_active: true
      }
    });

    if (!owner) {
      throw new Error('Invalid or inactive owner ID');
    }

    // Check if store name already exists
    const existingStore = await Store.findOne({
      where: { store_name: storeData.store_name, owner_id: storeData.owner_id, is_active: true }
    });

    if (existingStore) {
      throw new Error('Store name already exists');
    }

    // Generate unique store ID
    const storeId = await IdGenerator.generateUniqueStoreId();

    try {
      // Create store
      const store = await Store.create({
        store_id: storeId,
        store_name: storeData.store_name,
        owner_id: storeData.owner_id,
        is_active: true,
        created_at: new Date()
      });

      return {
        store_id: store.store_id,
        store_name: store.store_name,
        owner_id: store.owner_id
      };
    } catch (error) {
      throw new Error('Failed to register store: ' + error.message);
    }
  }

  async completeProfile(profileData, token) {
    // Verify token and get owner details
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }

    // Validate token is active in owner_login
    const activeLogin = await OwnerLogin.findOne({
      where: {
        owner_id: decodedToken.owner_id,
        token: token,
        is_active: true
      }
    });

    if (!activeLogin) {
      throw new Error('Invalid or expired session');
    }

    // Validate owner exists and is active
    const owner = await Owner.findOne({
      where: {
        owner_id: decodedToken.owner_id,
        is_active: true
      }
    });

    if (!owner) {
      throw new Error('Invalid or inactive owner');
    }

    // Validate required fields
    const requiredFields = [
      'store_id', 'store_name', 'address',
      'latitude', 'longitude', 'city', 'state', 'pincode',
      'opening_time', 'closing_time'
    ];

    for (const field of requiredFields) {
      if (!profileData[field]) {
        throw new Error(`${field.replace('_', ' ')} is required`);
      }
    }

    // Validate store existence and ownership
    const store = await Store.findOne({
      where: { 
        store_id: profileData.store_id,
        owner_id: decodedToken.owner_id,
        is_active: true 
      }
    });

    if (!store) {
      throw new Error('Store not found or unauthorized access');
    }

    // Validate coordinates
    if (profileData.latitude < -90 || profileData.latitude > 90) {
      throw new Error('Invalid latitude. Must be between -90 and 90');
    }
    if (profileData.longitude < -180 || profileData.longitude > 180) {
      throw new Error('Invalid longitude. Must be between -180 and 180');
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(profileData.opening_time) || !timeRegex.test(profileData.closing_time)) {
      throw new Error('Invalid time format. Use HH:mm format');
    }

    // Validate pincode
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(profileData.pincode)) {
      throw new Error('Invalid pincode format. Must be 6 digits');
    }

    try {
        // Check if store detail already exists
        const existingStoreDetail = await StoreDetail.findOne({
            where: {
                store_id: profileData.store_id,
                owner_id: decodedToken.owner_id
            }
        });

        let storeDetail;
        if (existingStoreDetail) {
            // Update existing store detail
            storeDetail = await existingStoreDetail.update({
                store_name: profileData.store_name,
                store_image: profileData.store_image,
                address: profileData.address,
                latitude: profileData.latitude,
                longitude: profileData.longitude,
                landmark: profileData.landmark,
                city: profileData.city,
                state: profileData.state,
                pincode: profileData.pincode,
                opening_time: profileData.opening_time,
                closing_time: profileData.closing_time,
                updated_at: new Date()
            });
        } else {
            // Create new store detail
            storeDetail = await StoreDetail.create({
                store_id: profileData.store_id,
                owner_id: decodedToken.owner_id,
                store_name: profileData.store_name,
                store_image: profileData.store_image,
                address: profileData.address,
                latitude: profileData.latitude,
                longitude: profileData.longitude,
                landmark: profileData.landmark,
                city: profileData.city,
                state: profileData.state,
                pincode: profileData.pincode,
                opening_time: profileData.opening_time,
                closing_time: profileData.closing_time,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        // Update Redis cache
        const redisKey = `store:${profileData.store_id}`;
        await redisClient.del(redisKey); // Delete existing cache

        return {
            store_id: storeDetail.store_id,
            store_name: storeDetail.store_name,
            owner_id: storeDetail.owner_id,
            store_image: storeDetail.store_image,
            address: storeDetail.address,
            latitude: storeDetail.latitude,
            longitude: storeDetail.longitude,
            landmark: storeDetail.landmark,
            city: storeDetail.city,
            state: storeDetail.state,
            pincode: storeDetail.pincode,
            opening_time: storeDetail.opening_time,
            closing_time: storeDetail.closing_time
        };
    } catch (error) {
        throw new Error('Failed to update store profile: ' + error.message);
    }
  }

  async getStoreDetails(storeId) {
    if (!storeId) {
      throw new Error('Store ID is required');
    }

    // Try to get from Redis cache first
    const redisKey = `store:${storeId}`;
    const cachedData = await redisClient.get(redisKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // If not in cache, get from database
    const storeDetail = await StoreDetail.findOne({
      where: { store_id: storeId },
      include: [{
        model: Store,
        where: {
          store_id: storeId,
          is_active: true
        },
        attributes: []  // Don't include Store model attributes in result
      }]
    });

    if (!storeDetail) {
      throw new Error('Store not found or inactive');
    }

    // Cache the result
    await redisClient.setEx(redisKey, 3600, JSON.stringify(storeDetail)); // Cache for 1 hour

    return {
      store_id: storeDetail.store_id,
      store_name: storeDetail.store_name,
      owner_name: storeDetail.owner_name,
      store_image: storeDetail.store_image,
      address: storeDetail.address,
      latitude: storeDetail.latitude,
      longitude: storeDetail.longitude,
      landmark: storeDetail.landmark,
      city: storeDetail.city,
      state: storeDetail.state,
      pincode: storeDetail.pincode,
      opening_time: storeDetail.opening_time,
      closing_time: storeDetail.closing_time,
      created_at: storeDetail.created_at,
      updated_at: storeDetail.updated_at
    };
  }

  async updateStoreStatus(store_id, token, is_open) {
    // Verify token and get owner details
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }

    // Validate token is active in owner_login
    const activeLogin = await OwnerLogin.findOne({
        where: {
            owner_id: decodedToken.owner_id,
            token: token,
            is_active: true
        }
    });

    if (!activeLogin) {
        throw new Error('Invalid or expired session');
    }

    // Validate owner exists and is active
    const owner = await Owner.findOne({
        where: {
            owner_id: decodedToken.owner_id,
            is_active: true
        }
    });

    if (!owner) {
        throw new Error('Invalid or inactive owner');
    }

    // Validate store existence and ownership
    const store = await Store.findOne({
        where: { 
            store_id: store_id,
            owner_id: decodedToken.owner_id,
            is_active: true 
        }
    });

    if (!store) {
        throw new Error('Store not found or unauthorized access');
    }

    try {
        const currentTime = new Date();

        if (is_open) {
            // Check if there's already an open entry without closed_at
            const existingOpenEntry = await StoreOpenClose.findOne({
              store_id: store_id,
              [Op.and]: [
                  { open_at: { [Op.ne]: null } }, // Not null
                  { open_at: { [Op.ne]: "" } }   // Not an empty string
              ],
              closed_at: null,
                order: [['created_at', 'DESC']]
            });

            if (existingOpenEntry) {
                throw new Error('Store is already open');
            }

            // Create new open entry
            const openEntry = await StoreOpenClose.create({
                store_id: store_id,
                open_at: currentTime,
                created_at: currentTime
            });

            return {
                store_id: store.store_id,
                store_name: store.store_name,
                open_at: openEntry.open_at,
                status: 'open'
            };
        } else {
            // Find the latest open entry without closed_at
            const openEntry = await StoreOpenClose.findOne({
              store_id: store_id,
              [Op.and]: [
                  { open_at: { [Op.ne]: null } }, // Not null
                  { open_at: { [Op.ne]: "" } }   // Not an empty string
              ],
              closed_at: null,
                order: [['created_at', 'DESC']]
            });

            if (!openEntry) {
                throw new Error('Store is not open');
            }

            // Update the entry with closed_at
            await openEntry.update({
                closed_at: currentTime,
                updated_at: currentTime
            });

            return {
                store_id: store.store_id,
                store_name: store.store_name,
                open_at: openEntry.open_at,
                closed_at: currentTime,
                status: 'closed'
            };
        }
    } catch (error) {
        throw new Error('Failed to update store status: ' + error.message);
    }
  }
}

module.exports = new StoreService(); 