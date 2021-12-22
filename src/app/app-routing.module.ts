import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: 'shop/home', pathMatch: 'full'},
    {path: 'home', redirectTo: 'shop/home', pathMatch: 'full'},
    {path: 'merchant-products', loadChildren: () => import('./pages/merchant-products/merchant-products.module').then(m => m.MerchantProductsPageModule)},
    {path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)},
    {path: 'signup', loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupPageModule)},
    {path: 'shop', loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)},
  /*{ path: 'checkout-buyer', loadChildren: () => import('./pages/checkout-buyer/checkout-buyer.module').then(m => m.CheckoutBuyerPageModule) },
  { path: 'checkout-cash', loadChildren: () => import('./pages/checkout-cash/checkout-cash.module').then(m => m.CheckoutCashPageModule) },
  { path: 'checkout-banks', loadChildren: () => import('./pages/checkout-banks/checkout-banks.module').then(m => m.CheckoutBanksPageModule) },
  { path: 'checkout-payer', loadChildren: () => import('./pages/checkout-payer/checkout-payer.module').then(m => m.CheckoutPayerPageModule) },
  { path: 'checkout-card', loadChildren: () => import('./pages/checkout-card/checkout-card.module').then(m => m.CheckoutCardPageModule) },
  { path: 'checkout-prepare', loadChildren: () => import('./pages/checkout-prepare/checkout-prepare.module').then(m => m.CheckoutPreparePageModule) },
  { path: 'buyer-select', loadChildren: () => import('./pages/buyer-select/buyer-select.module').then(m => m.BuyerSelectPageModule) },
  { path: 'payu-complete', loadChildren: () => import('./pages/payu-complete/payu-complete.module').then(m => m.PayuCompletePageModule) },
  { path: 'map', loadChildren: () => import('./pages/map/map.module').then(m => m.MapPageModule) },
  { path: 'cart', loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartPageModule) },
  { path: 'chat-room', loadChildren: () => import('./pages/chat-room/chat-room.module').then(m => m.ChatRoomPageModule) },
  { path: 'comments', loadChildren: () => import('./pages/comments/comments.module').then(m => m.CommentsPageModule) },*/
  { path: 'categories', loadChildren: () => import('./pages/merchant-categories/merchant-categories.module').then(m => m.MerchantCategoriesPageModule) },
//  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'home', loadChildren: () => import('./pages/lonchis/lonchis.module').then(m => m.LonchisPageModule) },
  { path: 'home/calculadora', loadChildren: () => import('./pages/calculadora/calculadora.module').then(m => m.CalculadoraPageModule) },
  { path: 'home/conversion', loadChildren: () => import('./pages/conversion/conversion.module').then(m => m.ConversionPageModule) },
  { path: 'home/tutorial', loadChildren: () => import('./pages/tutorial/tutorial.module').then(m => m.TutorialPageModule) },
  { path: 'home/programar', loadChildren: () => import('./pages/programar/programar.module').then(m => m.ProgramarPageModule) },
  { path: 'home/products/:objectId', loadChildren: () => import('./pages/merchant-products/merchant-products.module').then(m => m.MerchantProductsPageModule) },
  { path: 'home/:categoryId', loadChildren: () => import('./pages/merchant-listing/merchant-listing.module').then(m => m.MerchantListingPageModule) },
  { path: 'home/:categoryId/merchant/:objectId', loadChildren: () => import('./pages/merchant-detail/merchant-detail.module').then(m => m.MerchantDetailPageModule) },
  { path: 'home/:categoryId/merchant/:objectId/products', loadChildren: () => import('./pages/merchant-products/merchant-products.module').then(m => m.MerchantProductsPageModule) },
  { path: 'home/:categoryId/merchant/:objectId/book', loadChildren: () => import('./pages/booking/booking.module').then(m => m.BookingPageModule) },
  { path: 'search-filtering', loadChildren: () => import('./pages/search-filtering/search-filtering.module').then(m => m.SearchFilteringPageModule) },
  /*{ path: 'booking-list', loadChildren: () => import('./pages/booking-list/booking-list.module').then(m => m.BookingListPageModule) },
  { path: 'booking-detail', loadChildren: () => import('./pages/booking-detail/booking-detail.module').then(m => m.BookingDetailPageModule) },
  { path: 'routes', loadChildren: () => import('./pages/routes/routes.module').then(m => m.RoutesPageModule) },
  { path: 'route-detail', loadChildren: () => import('./pages/route-detail/route-detail.module').then(m => m.RouteDetailPageModule) },
  { path: 'medical', loadChildren: () => import('./pages/medical/medical.module').then(m => m.MedicalPageModule) },
  { path: 'codes', loadChildren: () => import('./pages/codes/codes.module').then(m => m.CodesPageModule) },
  { path: 'video', loadChildren: () => import('./pages/video/video.module').then(m => m.VideoPageModule) },
  { path: 'contacts', loadChildren: () => import('./pages/contacts/contacts.module').then(m => m.ContactsPageModule) },
  { path: 'contact-detail', loadChildren: () => import('./pages/contact-detail/contact-detail.module').then(m => m.ContactDetailPageModule) },
  { path: 'groups', loadChildren: () => import('./pages/groups/groups.module').then(m => m.GroupsPageModule) },
  { path: 'group-detail', loadChildren: () => import('./pages/group-detail/group-detail.module').then(m => m.GroupDetailPageModule) },
  { path: 'select-contacts', loadChildren: () => import('./pages/select-contacts/select-contacts.module').then(m => m.SelectContactsPageModule) },
  { path: 'import-contacts', loadChildren: () => import('./pages/import-contacts/import-contacts.module').then(m => m.ImportContactsPageModule) },
  { path: 'opentok', loadChildren: () => import('./pages/opentok/opentok.module').then(m => m.OpentokPageModule) },
  { path: 'items', loadChildren: () => import('./pages/items/items.module').then(m => m.ItemsPageModule) },
  { path: 'item-detail', loadChildren: () => import('./pages/item-detail/item-detail.module').then(m => m.ItemDetailPageModule) },
  { path: 'create-merchant', loadChildren: () => import('./pages/create-merchant/create-merchant.module').then(m => m.CreateMerchantPageModule) },
  { path: 'mercado-pago', loadChildren: () => import('./pages/mercado-pago/mercado-pago.module').then(m => m.MercadoPagoPageModule) },
  { path: 'availabilities', loadChildren: () => import('./pages/availabilities/availabilities.module').then(m => m.AvailabilitiesPageModule) },
  { path: 'edit-products', loadChildren: () => import('./pages/edit-products/edit-products.module').then(m => m.EditProductsPageModule) },
  { path: 'images', loadChildren: () => import('./pages/images/images.module').then(m => m.ImagesPageModule) },
  { path: 'availability-create', loadChildren: () => import('./pages/availability-create/availability-create.module').then(m => m.AvailabilityCreatePageModule) },
  { path: 'mercado-pago-options', loadChildren: () => import('./pages/mercado-pago-options/mercado-pago-options.module').then(m => m.MercadoPagoOptionsPageModule) },*/
  { path: 'forgot-pass', loadChildren: () => import('./pages/forgot-pass/forgot-pass.module').then(m => m.ForgotPassPageModule) },  {
    path: 'admin-login',
    loadChildren: () => import('./pages/admin-login/admin-login.module').then( m => m.AdminLoginPageModule)
  },

  /*{ path: 'new-merchant', loadChildren: () => import('./pages/new-merchant/new-merchant.module').then(m => m.NewMerchantPageModule) },
  { path: 'zoom-meeting', loadChildren: () => import('./pages/zoom-meeting/zoom-meeting.module').then(m => m.ZoomMeetingPageModule) },*/
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
