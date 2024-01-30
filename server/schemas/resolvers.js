const { AutheaticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {   
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({})
                    .select('-__v -password')
                    .populate('savedBooks');

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },
    },

    Mutation: {
        //Add new user
        addUser: async (parent, { username, email, password }) => {
            //create user
            const user = await User.create({ username, email, password });
            //create token
            const token = signToken(user);
            //return token and user
            return { token, user };
        },
        //Login user
        login: async (parent, { email, password }) => {
            //find user by email
            const user = await User.findOne({ email });
            //if no user found
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            //check password
            const correctPw = await user.isCorrectPassword(password);
            //if password incorrect
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            //create token
            const token = signToken(user);
            //return token and user
            return { token, user };
        },

        //Save book

        saveBook: async (parent, { book }, context) => {
            //Check if user is logged in
            if (context.user) {
                //save book to user
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: book } },
                    { new: true }
                );
                //return updated user
                return updatedUser;
            }
            //if user not logged in
            throw new AuthenticationError('You need to be logged in!');
        },

        //Remove book
        removeBook: async (parent, { bookId }, context) => {
            //Check if user is logged in
            if (context.user) {
                //remove book from user
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                //return updated user
                return updatedUser;
            }
            //if user not logged in
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

//export resolvers
module.exports = resolvers;