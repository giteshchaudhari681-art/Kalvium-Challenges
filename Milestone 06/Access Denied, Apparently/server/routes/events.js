import express from 'express';
import { events } from '../data/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Middleware to protect all routes
router.use(authMiddleware);

const serializeEventForUser = (event, user) => ({
    ...event,
    isCreator: event.creatorId === user.id,
    isInvited: event.invitedEmails.includes(user.email),
    hasRSVPed: event.rsvps.includes(user.id)
});

const canAccessEvent = (event, user) =>
    event.creatorId === user.id || event.invitedEmails.includes(user.email);

router.get('/', (req, res) => {
    const visibleEvents = events
        .filter(event => canAccessEvent(event, req.user))
        .map(event => serializeEventForUser(event, req.user));

    res.json(visibleEvents);
});

router.post('/', (req, res) => {
    const { title, description, date, invitedEmails } = req.body;
    const newEvent = {
        id: Date.now().toString(),
        title,
        description,
        date,
        creatorId: req.user.id,
        invitedEmails: invitedEmails || [],
        rsvps: []
    };
    events.push(newEvent);
    console.log(`Invitations sent for event "${title}" to: ${newEvent.invitedEmails.join(', ')}`);
    res.status(201).json(newEvent);
});

router.get('/:id', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!canAccessEvent(event, req.user)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(serializeEventForUser(event, req.user));
});

router.post('/:id/rsvp', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.invitedEmails.includes(req.user.email)) {
        return res.status(403).json({ message: 'Only invited guests can RSVP to this event' });
    }

    if (event.rsvps.includes(req.user.id)) {
        return res.status(400).json({ message: 'You have already RSVPed to this event' });
    }

    event.rsvps.push(req.user.id);
    res.json({ message: 'RSVP successful', event: serializeEventForUser(event, req.user) });
});

router.delete('/:id', (req, res) => {
    const index = events.findIndex(e => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Event not found' });

    if (events[index].creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Only the event creator can delete this event' });
    }

    events.splice(index, 1);
    res.json({ message: 'Event deleted' });
});

export default router;
