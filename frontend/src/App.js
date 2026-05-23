import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import PhotographerProfile from './pages/PhotographerProfile';
import SearchPage from "./pages/SearchPage";
import ChooseAccount from "./pages/ChooseAccount";
import RegisterUser from './pages/RegisterUser';
import RegisterPhotographer from './pages/RegisterPhotographer';
import UserProfile from './pages/UserProfile';
import EditProfile from "./pages/EditProfile";
import Prices from "./pages/Prices";
import PhotographerCalendar from "./pages/PhotographerCalendar";
import AddAlbum from "./pages/AddAlbum";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import BookingForm from './pages/UserBookingPage';
import UploadFilesPage from './pages/UploadFilesPage';
import AccessDenied from "./components/AccessDenied";
import ProtectedRoute from "./components/ProtectedRoute";
import AlbumDetails from "./pages/AlbumDetails";
import ReviewsPage from "./pages/ReviewsPage";  
import PhotographerPublic from "./pages/PhotographerPublic";
import PublicAlbume from "./pages/PublicAlbume";
import PublicServicii from "./pages/PublicServicii";
import UserBookingPageWrapper from "./pages/UserBookingPageWrapper";
import RecenziileMele from "./pages/RecenziileMele";
import RezervarileMele from "./pages/RezervarileMele";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/photographer-profile" element={<PhotographerProfile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/register-photographer" element={<RegisterPhotographer />} />
        <Route path="/choose-account" element={<ChooseAccount />} />
        <Route path="/client-profile" element={<UserProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/prices" element={<Prices />} />
        <Route path="/profile/calendar" element={<PhotographerCalendar />} />
        <Route path="/profile/add-album" element={<AddAlbum />} />
        <Route path="/booking-test" element={<BookingForm />} />
        <Route path="/upload-files" element={<UploadFilesPage />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/profile/album/:id" element={<AlbumDetails />} />
        <Route path="/reviews/:prestatorId" element={<ReviewsPage />} />
        <Route path="/profil-public/:id" element={<PhotographerPublic />} />
        <Route path="/public/albume/:userId" element={<PublicAlbume />} />
        <Route path="/servicii/:id" element={<PublicServicii />} />
        <Route path="/rezervare/:id" element={<UserBookingPageWrapper />} />
        <Route path="/recenziile-mele" element={<RecenziileMele />} />
        <Route path="/rezervarile-mele" element={<RezervarileMele />} />


        {/*  Rute protejate */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Messages />} /> {/* <-- linia nouă */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
