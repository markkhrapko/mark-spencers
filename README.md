# Mark & Spencer's Blog

A simple, clean blog for engineering content with infinite scroll, beautiful image carousels, and a sleek dark theme matching your personal website style.

## How to Add New Posts

1. Open the `posts.json` file
2. Add your new post at the **beginning** of the "posts" array (this makes it appear first)
3. Follow this format:

```json
{
  "id": "your-post-id",
  "title": "Your Post Title",
  "content": [
    "First paragraph of your post.",
    "Second paragraph of your post.",
    "Each paragraph should be a separate string in the array."
  ],
  "images": [
    {
      "url": "images/your-image.jpg",
      "caption": "Description of the image"
    }
  ]
}
```

### Example of Adding a New Post

To add a new post about "Neural Dust", you would add this at the beginning of the posts array:

```json
{
  "posts": [
    {
      "id": "neural-dust",
      "title": "Neural Dust",
      "content": [
        "We've been investigating ultrasonic powered neural dust motes.",
        "These tiny sensors can be implanted without wires.",
        "Power and data transmission happens via ultrasound."
      ],
      "images": [
        {
          "url": "images/neural-dust-1.jpg",
          "caption": "Size comparison of neural dust mote"
        }
      ]
    },
    // ... rest of your existing posts
  ]
}
```

## Important Notes

- **ID**: Must be unique and URL-friendly (lowercase, hyphens instead of spaces)
- **Images**: Optional. If you don't have images, just omit the "images" field
- **Image Files**: Place your images in an `images/` folder in the same directory
- **Content**: Each paragraph should be a separate string in the content array
- **Carousel**: Images automatically display in a beautiful carousel that matches your personal website style
  - Click to activate and auto-advance
  - Swipe support on mobile
  - Smooth transitions and hover effects
- **Dark Theme**: Sleek black background with carefully chosen text colors for comfortable reading
- **Teleportation Effect**: "Take me home" buttons trigger a cool crumple-and-explode animation instead of scrolling

## Setting Up Images

1. Create an `images` folder in your project directory
2. Add your images there (JPG, PNG, etc.)
3. Reference them in posts.json as `images/filename.jpg`

## Hosting

### GitHub Pages
1. Push all files to a GitHub repository
2. Go to Settings → Pages
3. Select source branch and save
4. Your blog will be available at `https://[username].github.io/[repository-name]/`

### Vercel
1. Push files to GitHub
2. Import project on Vercel
3. Deploy with default settings

## Local Testing

To test locally, you need a local server (due to CORS restrictions):

### Using Python:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`

### Using Node.js:
```bash
npx http-server
```

## File Structure
```
mark-spencers/
├── index.html      # Main HTML file
├── blog.js         # JavaScript functionality
├── posts.json      # Your blog posts (edit this to add content)
├── README.md       # This file
└── images/         # Folder for your images
    ├── hydrogel-1.jpg
    ├── hydrogel-2.jpg
    └── ...
```
