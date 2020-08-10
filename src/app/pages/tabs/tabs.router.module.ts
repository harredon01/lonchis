import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TabsPage} from './tabs.page';

const routes: Routes = [
    {
        path: '',
        component: TabsPage,
        children: [
            {
                path: 'home',
                children: [
                    //                    {
                    //                        path: '',
                    //                        loadChildren: '../home/home.module#HomePageModule'
                    //                    },
                    {
                        path: '',
                        loadChildren: () => import('../lonchis/lonchis.module').then(m => m.LonchisPageModule)
                    },
                    {
                        path: 'calculadora',
                        loadChildren: () => import('../calculadora/calculadora.module').then(m => m.CalculadoraPageModule)
                    },
                    {
                        path: 'comments',
                        loadChildren: () => import('../comments/comments.module').then(m => m.CommentsPageModule)
                    },
                    {
                        path: 'programar',
                        loadChildren: () => import('../programar/programar.module').then(m => m.ProgramarPageModule)
                    },
                    {
                        path: 'programar/complete',
                        loadChildren: () => import('../program-complete/program-complete.module').then(m => m.ProgramCompletePageModule)
                    },
                    {
                        path: 'conversion',
                        loadChildren: () => import('../conversion/conversion.module').then(m => m.ConversionPageModule)
                    },
                    {
                        path: 'products/:objectId',
                        loadChildren: () => import('../merchant-products/merchant-products.module').then(m => m.MerchantProductsPageModule),
                    },
                    {
                        path: 'tutorial',
                        loadChildren: () => import('../tutorial/tutorial.module').then(m => m.TutorialPageModule),
                    },
                    {
                        path: 'checkout',
                        children: [
                            {
                                path: 'shipping/:merchant_id',
                                loadChildren: () => import('../checkout-shipping/checkout-shipping.module').then(m => m.CheckoutShippingPageModule)
                            },
                            {
                                path: 'prepare',
                                loadChildren: () => import('../checkout-prepare/checkout-prepare.module').then(m => m.CheckoutPreparePageModule)
                            },
                            {
                                path: 'mercado-pago-options',
                                children: [
                                    {
                                        path: '',
                                        loadChildren: () => import('../mercado-pago-options/mercado-pago-options.module').then(m => m.MercadoPagoOptionsPageModule)
                                    },
                                    {
                                        path: 'card',
                                        loadChildren: () => import('../mercado-pago/mercado-pago.module').then(m => m.MercadoPagoPageModule)
                                    },
                                    {
                                        path: 'thankyou',
                                        loadChildren: () => import('../mercado-pago-thankyou/mercado-pago-thankyou.module').then(m => m.MercadoPagoThankyouPageModule)
                                    }
                                ]
                            },
                            {
                                path: 'payu',
                                children: [
                                    {
                                        path: 'credit',
                                        children: [
                                            {
                                                path: 'buyer',
                                                loadChildren: () => import('../checkout-buyer/checkout-buyer.module').then(m => m.CheckoutBuyerPageModule)
                                            },
                                            {
                                                path: 'payer',
                                                loadChildren: () => import('../checkout-payer/checkout-payer.module').then(m => m.CheckoutPayerPageModule)
                                            },
                                            {
                                                path: 'card',
                                                loadChildren: () => import('../checkout-card/checkout-card.module').then(m => m.CheckoutCardPageModule)
                                            }
                                        ]
                                    },
                                    {
                                        path: 'cash',
                                        loadChildren: () => import('../checkout-cash/checkout-cash.module').then(m => m.CheckoutCashPageModule)
                                    },
                                    {
                                        path: 'banks',
                                        loadChildren: () => import('../checkout-banks/checkout-banks.module').then(m => m.CheckoutBanksPageModule)
                                    },
                                    {
                                        path: 'complete',
                                        loadChildren: () => import('../payu-complete/payu-complete.module').then(m => m.PayuCompletePageModule)
                                    },
                                    {
                                        path: 'options',
                                        loadChildren: () => import('../checkout-options-payu/checkout-options-payu.module').then(m => m.CheckoutOptionsPayuPageModule)
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        path: 'categories',
                        children: [
                            {
                                path: ':categoryId',
                                children: [
                                    {
                                        path: '',
                                        loadChildren: () => import('../merchant-listing/merchant-listing.module').then(m => m.MerchantListingPageModule),
                                    },
                                    {
                                        path: 'merchant/:objectId',
                                        children: [
                                            {
                                                path: '',
                                                loadChildren: () => import('../merchant-detail/merchant-detail.module').then(m => m.MerchantDetailPageModule),
                                            },
                                            {
                                                path: 'products',
                                                children: [
                                                    {
                                                        path: '',
                                                        loadChildren: () => import('../merchant-products/merchant-products.module').then(m => m.MerchantProductsPageModule),
                                                    }
                                                ]
                                            },
                                            {
                                                path: 'chat',
                                                loadChildren: () => import('../chat-room/chat-room.module').then(m => m.ChatRoomPageModule)
                                            },
                                            {
                                                path: 'book',
                                                loadChildren: () => import('../booking/booking.module').then(m => m.BookingPageModule),
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                ]
            },
            {
                path: 'map',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../map/map.module').then(m => m.MapPageModule)
                    }
                ]
            },
            {
                path: 'mercado-pago-options',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../mercado-pago-options/mercado-pago-options.module').then(m => m.MercadoPagoOptionsPageModule)
                    },
                    {
                        path: 'card',
                        loadChildren: () => import('../mercado-pago/mercado-pago.module').then(m => m.MercadoPagoPageModule)
                    },
                    {
                        path: 'thankyou',
                        loadChildren: () => import('../mercado-pago-thankyou/mercado-pago-thankyou.module').then(m => m.MercadoPagoThankyouPageModule)
                    }
                ]
            },
            {
                path: 'opentok',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../opentok/opentok.module').then(m => m.OpentokPageModule)
                    }
                ]
            },
            {
                path: 'routes',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../routes/routes.module').then(m => m.RoutesPageModule)
                    },
                    {
                        path: ':objectId',
                        loadChildren: () => import('../route-detail/route-detail.module').then(m => m.RouteDetailPageModule)
                    }
                ]
            },
            {
                path: 'chat-room',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../chat-room/chat-room.module').then(m => m.ChatRoomPageModule)
                    }
                ]
            },
            {
                path: 'contacts',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../contacts/contacts.module').then(m => m.ContactsPageModule)
                    },
                    {
                        path: 'import',
                        loadChildren: () => import('../import-contacts/import-contacts.module').then(m => m.ImportContactsPageModule)
                    },
                    {
                        path: ':objectId',
                        children: [
                            {
                                path: '',
                                loadChildren: () => import('../contact-detail/contact-detail.module').then(m => m.ContactDetailPageModule)
                            },
                            {
                                path: 'chat',
                                loadChildren: () => import('../chat-room/chat-room.module').then(m => m.ChatRoomPageModule)
                            }
                        ]
                    },

                ]
            }, {
                path: 'groups',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../groups/groups.module').then(m => m.GroupsPageModule)
                    },
                    {
                        path: ':objectId',
                        children: [
                            {
                                path: '',
                                loadChildren: () => import('../group-detail/group-detail.module').then(m => m.GroupDetailPageModule)
                            },
                            {
                                path: 'chat',
                                loadChildren: () => import('../chat-room/chat-room.module').then(m => m.ChatRoomPageModule)
                            }
                        ]
                    }
                ]
            },
            {
                path: 'checkout',
                children: [
                    {
                        path: 'shipping/:merchant_id',
                        loadChildren: () => import('../checkout-shipping/checkout-shipping.module').then(m => m.CheckoutShippingPageModule)
                    },
                    {
                        path: 'prepare',
                        loadChildren: () => import('../checkout-prepare/checkout-prepare.module').then(m => m.CheckoutPreparePageModule)
                    },
                ]
            },
            {
                path: 'payu',
                children: [
                    {
                        path: 'credit',
                        children: [
                            {
                                path: 'buyer',
                                loadChildren: () => import('../checkout-buyer/checkout-buyer.module').then(m => m.CheckoutBuyerPageModule)
                            },
                            {
                                path: 'payer',
                                loadChildren: () => import('../checkout-payer/checkout-payer.module').then(m => m.CheckoutPayerPageModule)
                            },
                            {
                                path: 'card',
                                loadChildren: () => import('../checkout-card/checkout-card.module').then(m => m.CheckoutCardPageModule)
                            }
                        ]
                    },
                    {
                        path: 'cash',
                        loadChildren: () => import('../checkout-cash/checkout-cash.module').then(m => m.CheckoutCashPageModule)
                    },
                    {
                        path: 'banks',
                        loadChildren: () => import('../checkout-banks/checkout-banks.module').then(m => m.CheckoutBanksPageModule)
                    },
                    {
                        path: 'complete',
                        loadChildren: () => import('../payu-complete/payu-complete.module').then(m => m.PayuCompletePageModule)
                    },
                    {
                        path: 'options',
                        loadChildren: () => import('../checkout-options-payu/checkout-options-payu.module').then(m => m.CheckoutOptionsPayuPageModule)
                    },
                ]
            },
            {
                path: 'settings',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
                    },
                    {
                        path: 'my-account',
                        loadChildren: () => import('../my-account/my-account.module').then(m => m.MyAccountPageModule)
                    },
                    {
                        path: 'payments',
                        children: [
                            {
                                path: '',
                                loadChildren: () => import('../payments/payments.module').then(m => m.PaymentsPageModule)
                            },
                            {
                                path: ':objectId',
                                children: [
                                    {
                                        path: '',
                                        loadChildren: () => import('../payment-detail/payment-detail.module').then(m => m.PaymentDetailPageModule)
                                    },
                                    {
                                        path: 'mercado-pago-options',
                                        children: [
                                            {
                                                path: '',
                                                loadChildren: () => import('../mercado-pago-options/mercado-pago-options.module').then(m => m.MercadoPagoOptionsPageModule)
                                            },
                                            {
                                                path: 'card',
                                                loadChildren: () => import('../mercado-pago/mercado-pago.module').then(m => m.MercadoPagoPageModule)
                                            },
                                            {
                                                path: 'thankyou',
                                                loadChildren: () => import('../mercado-pago-thankyou/mercado-pago-thankyou.module').then(m => m.MercadoPagoThankyouPageModule)
                                            }
                                        ]
                                    },
                                    {
                                        path: 'payu',
                                        children: [
                                            {
                                                path: 'credit',
                                                children: [
                                                    {
                                                        path: 'buyer',
                                                        loadChildren: () => import('../checkout-buyer/checkout-buyer.module').then(m => m.CheckoutBuyerPageModule)
                                                    },
                                                    {
                                                        path: 'payer',
                                                        loadChildren: () => import('../checkout-payer/checkout-payer.module').then(m => m.CheckoutPayerPageModule)
                                                    },
                                                    {
                                                        path: 'card',
                                                        loadChildren: () => import('../checkout-card/checkout-card.module').then(m => m.CheckoutCardPageModule)
                                                    }
                                                ]
                                            },
                                            {
                                                path: 'cash',
                                                loadChildren: () => import('../checkout-cash/checkout-cash.module').then(m => m.CheckoutCashPageModule)
                                            },
                                            {
                                                path: 'banks',
                                                loadChildren: () => import('../checkout-banks/checkout-banks.module').then(m => m.CheckoutBanksPageModule)
                                            },
                                            {
                                                path: 'complete',
                                                loadChildren: () => import('../payu-complete/payu-complete.module').then(m => m.PayuCompletePageModule)
                                            },
                                            {
                                                path: 'options',
                                                loadChildren: () => import('../checkout-options-payu/checkout-options-payu.module').then(m => m.CheckoutOptionsPayuPageModule)
                                            },
                                        ]
                                    },
                                ]
                            },

                        ]
                    },
                    {
                        path: 'merchants',
                        children: [
                            {
                                path: '',
                                loadChildren: () => import('../merchant-listing/merchant-listing.module').then(m => m.MerchantListingPageModule)
                            },
                            {
                                path: 'create-merchant',
                                loadChildren: () => import('../new-merchant/new-merchant.module').then(m => m.NewMerchantPageModule)
                            },
                            {
                                path: ':objectId',
                                children: [
                                    {
                                        path: '',
                                        loadChildren: () => import('../create-merchant/create-merchant.module').then(m => m.CreateMerchantPageModule)
                                    },
                                    {
                                        path: 'products',
                                        children: [
                                            {
                                                path: '',
                                                loadChildren: () => import('../merchant-products/merchant-products.module').then(m => m.MerchantProductsPageModule),
                                            },
                                            {
                                                path: 'edit/:productId',
                                                loadChildren: () => import('../edit-products/edit-products.module').then(m => m.EditProductsPageModule),
                                            },
                                            {
                                                path: 'images/:productId',
                                                loadChildren: () => import('../images/images.module').then(m => m.ImagesPageModule),
                                            }
                                        ]
                                    },
                                    {
                                        path: 'chat',
                                        loadChildren: () => import('../chat-room/chat-room.module').then(m => m.ChatRoomPageModule)
                                    },
                                    {
                                        path: 'bookings',
                                        children: [
                                            {
                                                path: '',
                                                loadChildren: () => import('../booking-list/booking-list.module').then(m => m.BookingListPageModule),
                                            },
                                            {
                                                path: ':bookingId',
                                                loadChildren: () => import('../booking-detail/booking-detail.module').then(m => m.BookingDetailPageModule),
                                            },
                                            {
                                                path: ':bookingId/edit',
                                                loadChildren: () => import('../booking/booking.module').then(m => m.BookingPageModule),
                                            }
                                        ]
                                    },
                                    {
                                        path: 'items',
                                        children: [
                                            {
                                                path: '',
                                                loadChildren: () => import('../items/items.module').then(m => m.ItemsPageModule),
                                            },
                                            {
                                                path: ':itemId',
                                                loadChildren: () => import('../item-detail/item-detail.module').then(m => m.ItemDetailPageModule),
                                            }
                                        ]
                                    },
                                    {
                                        path: 'availabilities',
                                        loadChildren: () => import('../availabilities/availabilities.module').then(m => m.AvailabilitiesPageModule),
                                    },
                                    {
                                        path: 'images',
                                        loadChildren: () => import('../images/images.module').then(m => m.ImagesPageModule),
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        path: 'addresses',
                        loadChildren: () => import('../addresses/addresses.module').then(m => m.AddressesPageModule)
                    },
                    {
                        path: 'medical',
                        loadChildren: () => import('../medical/medical.module').then(m => m.MedicalPageModule)
                    },
                    {
                        path: 'codes',
                        loadChildren: () => import('../codes/codes.module').then(m => m.CodesPageModule)
                    },
                    {
                        path: 'chat',
                        loadChildren: () => import('../chat-room/chat-room.module').then(m => m.ChatRoomPageModule)
                    },
                    {
                        path: 'password',
                        loadChildren: () => import('../password/password.module').then(m => m.PasswordPageModule)
                    },
                    {
                        path: 'bookings',
                        children: [
                            {
                                path: '',
                                loadChildren: () => import('../booking-list/booking-list.module').then(m => m.BookingListPageModule),
                            },
                            {
                                path: ':bookingId',
                                loadChildren: () => import('../booking-detail/booking-detail.module').then(m => m.BookingDetailPageModule),
                            },
                            {
                                path: ':bookingId/edit',
                                loadChildren: () => import('../booking/booking.module').then(m => m.BookingPageModule),
                            }
                        ]
                    },
                ]
            },
            {
                path: '',
                redirectTo: '/tabs/home',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class TabsPageRoutingModule {}
