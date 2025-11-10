import HomePage from '../pages/home/home-page';
import AddPage from '../pages/add/add-page';
import AuthPage from '../pages/auth/auth-page';
import FavoritePage from '../pages/favorite/favorite-page';

const routes = {
  '/home': new HomePage(),
  '/add': new AddPage(),
  '/auth': new AuthPage(),
  '/favorite': new FavoritePage(),
};

export default routes;