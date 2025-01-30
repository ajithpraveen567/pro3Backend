import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 

const server = express();
server.use(cors());
server.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Contact = mongoose.model('Contact', contactSchema);

// API Routes
server.post('/send/mail', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    res.status(400).json({ message: 'Error sending message', error });
  }
});

server.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error });
  }
});

// PUT Route - Update a Contact
server.put('/update/contact/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message } = req.body;

    // Update contact by ID
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { name, email, message },
      { new: true } // Returns updated document
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact updated successfully!', updatedContact });
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact', error });
  }
});

// DELETE Route - Delete a Contact
server.delete('/delete/contact/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete contact by ID
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully!', deletedContact });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error });
  }
});

// Start Server
const port = process.env.PORT || 5000;
server.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
