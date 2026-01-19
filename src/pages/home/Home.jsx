import React, { useEffect } from 'react';
import styles from './Home.module.css';
import SearchAndCategories from './searchAndCategories/SearchAndCategories';
import Products from './products/Products';
import SupportButton from '../supportButton/SupportButton';
import HeroSection from './heroSection/HeroSection';
import WhatsNew from './whatsNew/WhatsNew';
import CategoriesSection from './categoriesSection/CateoriesSection';
import UsersSection from './userSection/UsersSection';
import Donate from './donate/Donate';

const Home = () => {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', theme);
  }, []);

  return (
    <div className={styles.homeContainer}>
      <HeroSection />
      <WhatsNew />
      <SupportButton />
      <div className={styles.sectionSpacing}>
        <CategoriesSection onCategorySelect={(categoryName) => setSearchTerm(categoryName)} />
      </div>
      <div className={styles.sectionSpacing}>
        <Donate/>
      </div>
      <div className={styles.sectionSpacing}>
        <Products />
      </div>
    </div>
  );
};

export default Home;
