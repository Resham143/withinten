const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const redisClient = require('../config/redis');
const IdGenerator = require('../utils/id-generator');
const Owner = require('../models/owner.model');
const OwnerLogin = require('../models/owner_login.model');
const { Op } = require('sequelize');

class AuthService {

    async requestOtp(phone_number, owner_id) {
        // Find user with both phone number and owner_id
        const owner = await Owner.findOne({ 
            where: { 
                phone_number,
                owner_id,
                is_active: true 
            } 
        });

        if (!owner) {
            throw new Error('Invalid owner details');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in Redis with 5 minutes expiry
        const key = `${owner_id}:otp:${phone_number}`;
        
        await redisClient.setEx(key, 300, otp); // 300 seconds = 5 minutes

        // In production, you would send this via SMS
        console.log(`OTP for ${phone_number}: ${otp}`);

        return { message: 'OTP sent successfully' };
    }

    async loginWithOtp(phone_number, owner_id, otp) {
        // Check OTP in Redis with owner_id included in key
        const key = `${owner_id}:otp:${phone_number}`;
        const storedOtp = await redisClient.get(key);

        if (!storedOtp || storedOtp !== otp) {
            throw new Error('Invalid OTP or OTP expired');
        }

        // Find owner
        const owner = await Owner.findOne({ 
            where: { 
                phone_number,
                owner_id,
                is_active: true 
            } 
        });

        if (!owner) {
            throw new Error('Owner not found');
        }

        // Delete OTP from Redis after successful validation
        await redisClient.del(key);

        // Generate new token
        const token = this.generateToken(owner);

        try {
            // Deactivate all previous login tokens for this owner
            await OwnerLogin.update(
                { is_active: false },
                { where: { owner_id: owner.owner_id } }
            );
        } catch (error) {
            console.error('Error deactivating previous login tokens:', error);
        }

        // Store new token in owner_login table
        await OwnerLogin.create({
            owner_id: owner.owner_id,
            token: token,
            is_active: true,
            login_at: new Date(),
            created_at: new Date()
        });

        return token;
    }

    generateToken(owner) {
        return jwt.sign(
            {
                owner_id: owner.owner_id,
                phone_number: owner.phone_number
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    async showOtp(phone_number, owner_id) {
        const key = `${owner_id}:otp:${phone_number}`;
        const otp = await redisClient.get(key);

        if (!otp) {
            throw new Error('No active OTP found for this owner');
        }

        // Verify owner exists
        const owner = await Owner.findOne({ 
            where: { 
                phone_number,
                owner_id,
                is_active: true 
            } 
        });

        if (!owner) {
            throw new Error('Invalid owner details');
        }

        // Get TTL (Time To Live) for the OTP
        const ttl = await redisClient.ttl(key);
        const expires_at = new Date(Date.now() + (ttl * 1000));

        return {
            otp,
            expires_at
        };
    }

    async logout(token) {
        try {
            // Verify and decode the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if owner exists and is active
            const owner = await Owner.findOne({
                where: {
                    owner_id: decoded.owner_id,
                    is_active: true
                }
            });

            if (!owner) {
                throw new Error('Invalid owner');
            }

            // Find and validate token in owner_login table
            const ownerLogin = await OwnerLogin.findOne({
                where: {
                    owner_id: decoded.owner_id,
                    token: token,
                    is_active: true
                }
            });

            if (!ownerLogin) {
                throw new Error('Invalid or expired session');
            }

            // Deactivate the token
            await ownerLogin.update({ 
                is_active: false,
                updated_at: new Date()
            });

            return { message: 'Logged out successfully' };
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

}

module.exports = new AuthService(); 