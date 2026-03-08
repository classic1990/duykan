// ========================================
// MOVES ROUTES - DUYDODEE Streaming Platform
// ========================================

const express = require('express');
const router = express.Router();

// Mock data
const mockMovies = [
    {
        id: 1,
        title: 'The Last of Us',
        description: 'ซีรีส์ยอดเยี่ยมเกี่ยวกับการเอาชีวิตรอดในโลกหลังเกิดหายนะจูเบียม',
        year: 2023,
        poster: '/assets/images/the-last-of-us.jpg',
        rating: 9.5,
        status: 'active',
        createdAt: new Date('2023-01-15')
    },
    {
        id: 2,
        title: 'Stranger Things',
        description: 'ซีรีส์สยองขวัญวิทยาศาสตร์จาก Netflix',
        year: 2016,
        poster: '/assets/images/stranger-things.jpg',
        rating: 8.7,
        status: 'active',
        createdAt: new Date('2016-07-15')
    },
    {
        id: 3,
        title: 'Wednesday',
        description: 'ซีรีส์เกี่ยวกับ Wednesday Addams จาก The Addams Family',
        year: 2022,
        poster: '/assets/images/wednesday.jpg',
        rating: 8.1,
        status: 'active',
        createdAt: new Date('2022-11-23')
    },
    {
        id: 4,
        title: 'The Crown',
        description: 'ซีรีส์เกี่ยวกับพระราชวงศ์อังกฤษ',
        year: 2016,
        poster: '/assets/images/the-crown.jpg',
        rating: 8.6,
        status: 'active',
        createdAt: new Date('2016-11-04')
    },
    {
        id: 5,
        title: 'Squid Game',
        description: 'ซีรีส์เกาหลีเกี่ยวกับเกมการเอาชีวิตรอด',
        year: 2021,
        poster: '/assets/images/squid-game.jpg',
        rating: 8.0,
        status: 'active',
        createdAt: new Date('2021-09-17')
    }
];

// GET /api/movies - Get all movies
router.get('/', (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        
        let filteredMovies = [...mockMovies];
        
        // Filter by search
        if (search) {
            filteredMovies = filteredMovies.filter(movie => 
                movie.title.toLowerCase().includes(search.toLowerCase()) ||
                movie.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Filter by status
        if (status) {
            filteredMovies = filteredMovies.filter(movie => movie.status === status);
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: paginatedMovies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredMovies.length,
                pages: Math.ceil(filteredMovies.length / limit)
            }
        });
    } catch (error) {
        console.error('Error getting movies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get movies'
        });
    }
});

// GET /api/movies/:id - Get movie by ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const movie = mockMovies.find(m => m.id === parseInt(id));
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }
        
        res.json({
            success: true,
            data: movie
        });
    } catch (error) {
        console.error('Error getting movie:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get movie'
        });
    }
});

// POST /api/movies - Create new movie
router.post('/', (req, res) => {
    try {
        const { title, description, year, status = 'active' } = req.body;
        
        // Validation
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }
        
        // Create new movie
        const newMovie = {
            id: mockMovies.length + 1,
            title,
            description: description || '',
            year: year || new Date().getFullYear(),
            poster: '/assets/images/default-poster.jpg',
            rating: 0,
            status,
            createdAt: new Date()
        };
        
        mockMovies.push(newMovie);
        
        res.status(201).json({
            success: true,
            data: newMovie,
            message: 'Movie created successfully'
        });
    } catch (error) {
        console.error('Error creating movie:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create movie'
        });
    }
});

// PUT /api/movies/:id - Update movie
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, year, status } = req.body;
        
        const movieIndex = mockMovies.findIndex(m => m.id === parseInt(id));
        
        if (movieIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }
        
        // Update movie
        const updatedMovie = {
            ...mockMovies[movieIndex],
            title: title || mockMovies[movieIndex].title,
            description: description || mockMovies[movieIndex].description,
            year: year || mockMovies[movieIndex].year,
            status: status || mockMovies[movieIndex].status
        };
        
        mockMovies[movieIndex] = updatedMovie;
        
        res.json({
            success: true,
            data: updatedMovie,
            message: 'Movie updated successfully'
        });
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update movie'
        });
    }
});

// DELETE /api/movies/:id - Delete movie
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const movieIndex = mockMovies.findIndex(m => m.id === parseInt(id));
        
        if (movieIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }
        
        const deletedMovie = mockMovies[movieIndex];
        mockMovies.splice(movieIndex, 1);
        
        res.json({
            success: true,
            data: deletedMovie,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete movie'
        });
    }
});

// GET /api/search - Search movies
router.get('/search', (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        
        const searchResults = mockMovies.filter(movie => 
            movie.title.toLowerCase().includes(q.toLowerCase()) ||
            movie.description.toLowerCase().includes(q.toLowerCase())
        );
        
        res.json({
            success: true,
            data: searchResults,
            query: q
        });
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search movies'
        });
    }
});

module.exports = router;
