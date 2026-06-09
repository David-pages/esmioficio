import re
import os

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure imports are there
if "react-router-dom" not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", 
                              "import React, { useState, useEffect } from 'react';\nimport { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';")

# Only replace the state once if it has not been replaced
if "const [view, setView] = useState" in content:
    replacement = """
  const navigate = useNavigate();
  const location = useLocation();
  const view = location.pathname;
  
  const setView = (v: string) => {
    switch(v) {
      case 'HOME': navigate('/'); break;
      case 'SEARCH': navigate('/buscar'); break;
      case 'FAVORITES': navigate('/favoritos'); break;
      case 'PROFILE': navigate('/perfil'); break;
      case 'ADMIN': navigate('/admin'); break;
      case 'PRIVACY': navigate('/privacidad'); break;
      case 'TERMS': navigate('/terminos'); break;
      case 'ABOUT': navigate('/nosotros'); break;
      case 'BLOG': navigate('/blog'); break;
      default: navigate('/'); break;
    }
  };
"""
    content = re.sub(r"const \[view, setView\] = useState.*?;\n", replacement, content)

# Check if view === 'HOME' is still in the file
if "view === 'HOME'" in content:
    replacements = {
        "view === 'HOME'": "view === '/'",
        "view === 'SEARCH'": "view === '/buscar'",
        "view === 'FAVORITES'": "view === '/favoritos'",
        "view === 'PROFILE'": "view === '/perfil'",
        "view === 'ADMIN'": "view === '/admin'",
        "view === 'PRIVACY'": "view === '/privacidad'",
        "view === 'TERMS'": "view === '/terminos'",
        "view === 'ABOUT'": "view === '/nosotros'",
        "view === 'BLOG'": "view === '/blog'",
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
