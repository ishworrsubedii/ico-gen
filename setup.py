"""
Created By: ishwor subedi
Date: 2024-09-30
"""
from setuptools import setup, find_packages
import os


def read_requirements():
    req_file = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    with open(req_file) as f:
        return f.read().splitlines()


setup(
    name="icogen_core",
    version="0.1.0",
    description="Icon generator core package",
    author="Ishwor Subedi",
    author_email="ishworr.subedi@gmail.com",
    url="https://github.com/ishworrsubedii/ico-gen",
    packages=find_packages(),
    install_requires=read_requirements(),
    classifiers=[
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.10',
)
