
# ICO-GEN

ICO-GEN is a powerful tool that helps you generate icons using large language models (LLMs) and stable diffusion. Whether you need custom icons or want to edit existing ones, ICO-GEN makes it easy to create and download icons in multiple formats.

This project leverages modern AI technologies to generate high-quality icons that can be used in web development, mobile apps, or any other digital platform.

![img.png](imgs/img.png)


![img.png](img.png)
## Tech Stack

### Frontend:
- **Next.js**
- **TailwindCSS**

### Backend:
- **FastAPI**
- **Python**
- **Gemini API**

## Features

ICO-GEN comes with the following features to help you create the perfect icons:

- [x] Generate SVG images for icons automatically
- [x] Edit SVG properties such as shape, color, and size
- [x] Download generated images in multiple formats (SVG, PNG, JPEG)
- [ ] Expand customization options (coming soon)
- [ ] Edit Existing Icons (coming soon)  

## Installation

To get started, you'll need to install both the backend and frontend dependencies. Follow the steps below.

### Backend Installation

1. **Clone the Repository**:  
   Clone the project to your local machine using the command below:
   ```bash
   git clone https://github.com/your-repo/ico-gen.git
   cd ico-gen/backend
   ```

2. **Install Dependencies**:  
   Install the required Python packages by running:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Installation

1. **Navigate to Frontend Directory**:  
   Move to the frontend folder by using the following command:
   ```bash
   cd ../frontend/iconify
   ```

2. **Install Dependencies**:  
   Use npm to install the necessary packages for the frontend:
   ```bash
   npm install
   ```

## Usage

Once you've installed all the dependencies, you can start the project.

### Backend

To run the backend server using FastAPI:
```bash
python main.py
```

### Frontend

To start the frontend development server:
```bash
npm run dev
```

The frontend server will run on `localhost:3000` by default, and the backend API will be available at `localhost:8000`.

## Contributing

We are always looking for people to contribute to this project! If you have any improvements or new features you'd like to add, feel free to fork the project and create a pull request.

Before contributing, please check out the [CONTRIBUTING.md](CONTRIBUTING.md) to learn about the contribution guidelines.

## License

This project is licensed under the MIT License.

## Contact

If you have any questions or feedback, feel free to reach out via email or open an issue on GitHub. Contributions and suggestions are always welcome!
