import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../api/axios'

const SF = {
  page: { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' },
  radius: { borderRadius: '12px' },
  radiusSm: { borderRadius: '8px' },
  radiusXl: { borderRadius: '18px' },
}

function CartPanel({
  cart, customerPhone, customerName, customerVillage,
  customerLookup, lookingUp, searching, showSuggestions,
  suggestions, isCredit, paymentMethod, discountValue,
  discountType, subtotal, grandTotal, discountAmt,
  processing, receipt, error,
  onPhoneChange, onNameChange, onVillageChange,
  onSelectCustomer, onSetPayment, onToggleCredit,
  onChangeQty, onRemoveItem, onSetDiscountValue,
  onSetDiscountType, onCheckout, onClearCart,
  onPrintReceipt, onDismissReceipt, onHideSuggestions
}) {
  return (
    <div style={{
      ...SF.page,
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: '18px',
      overflow: 'hidden',
      position: 'sticky',
      top: '74px',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{
          fontSize: '15px', fontWeight: '600',
          color: 'var(--color-text-primary)', letterSpacing: '-0.2px'
        }}>
          Order
        </span>
        {cart.length > 0 && (
          <span style={{
            background: 'var(--color-background-secondary)',
            color: 'var(--color-text-secondary)',
            padding: '3px 10px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '500'
          }}>
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      <div style={{ padding: '16px 20px', overflowY: 'auto' }}>

        {/* Customer section */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: '0 0 8px'
          }}>Customer</p>

          {/* Phone */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <input
              placeholder="Phone number"
              value={customerPhone}
              onChange={e => onPhoneChange(e.target.value)}
              onBlur={() => setTimeout(() => onHideSuggestions(), 200)}
              maxLength={10}
              type="tel"
              autoComplete="off"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--color-background-secondary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: '10px', fontSize: '14px',
                color: 'var(--color-text-primary)', outline: 'none',
                boxSizing: 'border-box',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}
            />
            {(lookingUp || searching) && (
              <span style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '11px', color: 'var(--color-text-secondary)'
              }}>
                {searching ? 'Searching' : 'Looking up'}...
              </span>
            )}

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)',
                left: 0, right: 0, zIndex: 200,
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}>
                {suggestions.map((c, i) => (
                  <div
                    key={c.id}
                    onMouseDown={() => onSelectCustomer(c)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      borderBottom: i < suggestions.length - 1
                        ? '0.5px solid var(--color-border-tertiary)' : 'none',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={e =>
                      e.currentTarget.style.background =
                        'var(--color-background-secondary)'}
                    onMouseLeave={e =>
                      e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      fontSize: '13px', fontWeight: '500',
                      color: 'var(--color-text-primary)'
                    }}>
                      {c.name}
                      {c.village && (
                        <span style={{
                          color: 'var(--color-text-secondary)',
                          fontWeight: '400', marginLeft: '6px'
                        }}>
                          {c.village}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '12px', color: 'var(--color-text-secondary)',
                      marginTop: '1px'
                    }}>
                      {c.phone || 'No phone'}
                      {parseFloat(c.creditBalance || 0) > 0 && (
                        <span style={{
                          color: 'var(--color-text-danger)',
                          marginLeft: '8px'
                        }}>
                          ₹{parseFloat(c.creditBalance).toFixed(0)} due
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Returning customer pill */}
          {customerLookup && (
            <div style={{
              padding: '8px 12px', marginBottom: '8px',
              background: 'var(--color-background-success)',
              border: '0.5px solid var(--color-border-success)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'var(--color-text-success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', color: 'white', fontWeight: '600', flexShrink: 0
              }}>
                {customerLookup.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: '13px', fontWeight: '500',
                  color: 'var(--color-text-success)'
                }}>
                  {customerLookup.name}
                </span>
                {customerLookup.village && (
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--color-text-success)',
                    opacity: 0.7, marginLeft: '6px'
                  }}>
                    {customerLookup.village}
                  </span>
                )}
              </div>
              {parseFloat(customerLookup.creditBalance || 0) > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  color: 'var(--color-text-danger)'
                }}>
                  ₹{parseFloat(customerLookup.creditBalance).toFixed(0)} due
                </span>
              )}
            </div>
          )}

          {/* New customer */}
          {customerPhone.length >= 10 && !customerLookup && !lookingUp && (
            <div style={{
              padding: '8px 12px', marginBottom: '8px',
              background: 'var(--color-background-warning)',
              border: '0.5px solid var(--color-border-warning)',
              borderRadius: '10px',
              fontSize: '12px', color: 'var(--color-text-warning)'
            }}>
              New customer — will be saved after checkout
            </div>
          )}

          {/* Name */}
          <input
            placeholder="Customer name"
            value={customerName}
            onChange={e => onNameChange(e.target.value)}
            autoComplete="off"
            style={{
              width: '100%', padding: '10px 14px', marginBottom: '8px',
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: '10px', fontSize: '14px',
              color: 'var(--color-text-primary)', outline: 'none',
              boxSizing: 'border-box',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}
          />

          {/* Village */}
          <input
            placeholder="Village / area"
            value={customerVillage}
            onChange={e => onVillageChange(e.target.value)}
            autoComplete="off"
            style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: '10px', fontSize: '14px',
              color: 'var(--color-text-primary)', outline: 'none',
              boxSizing: 'border-box',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}
          />
        </div>

        {/* Payment method */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: '0 0 8px'
          }}>Payment</p>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px'
          }}>
            {[
              { id: 'CASH', label: 'Cash' },
              { id: 'UPI', label: 'UPI' },
              { id: 'CARD', label: 'Card' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => onSetPayment(m.id)}
                style={{
                  padding: '9px 0',
                  fontSize: '13px', fontWeight: '500',
                  borderRadius: '10px',
                  border: paymentMethod === m.id
                    ? '1.5px solid #1a3c1a'
                    : '0.5px solid var(--color-border-tertiary)',
                  background: paymentMethod === m.id
                    ? '#1a3c1a' : 'var(--color-background-secondary)',
                  color: paymentMethod === m.id
                    ? 'white' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Credit toggle */}
        {customerLookup && (
          <div style={{
            marginBottom: '20px', padding: '12px 14px',
            background: isCredit
              ? 'var(--color-background-danger)'
              : 'var(--color-background-secondary)',
            border: `0.5px solid ${isCredit
              ? 'var(--color-border-danger)'
              : 'var(--color-border-tertiary)'}`,
            borderRadius: '12px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '13px', fontWeight: '500',
                color: 'var(--color-text-primary)', margin: '0 0 2px'
              }}>
                Credit sale
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)', margin: 0
              }}>
                Customer pays later
              </p>
            </div>
            <button
              onClick={onToggleCredit}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: '500',
                borderRadius: '20px',
                border: isCredit
                  ? '1px solid var(--color-border-danger)'
                  : '0.5px solid var(--color-border-secondary)',
                background: isCredit
                  ? 'var(--color-text-danger)' : 'transparent',
                color: isCredit
                  ? 'white' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>
              {isCredit ? 'On credit' : 'Set credit'}
            </button>
          </div>
        )}

        {/* Cart items */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: '0 0 8px'
          }}>Items</p>

          {cart.length === 0 ? (
            <div style={{
              padding: '24px 0', textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '13px'
            }}>
              No items added yet
            </div>
          ) : (
            <div style={{
              maxHeight: '220px', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '2px'
            }}>
              {cart.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 0',
                  borderBottom: i < cart.length - 1
                    ? '0.5px solid var(--color-border-tertiary)' : 'none'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px', fontWeight: '500',
                      color: 'var(--color-text-primary)',
                      margin: '0 0 2px',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.name}
                    </p>
                    <p style={{
                      fontSize: '12px', color: 'var(--color-text-secondary)',
                      margin: 0
                    }}>
                      ₹{item.price.toFixed(0)} each
                    </p>
                  </div>

                  {/* Qty stepper */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0',
                    background: 'var(--color-background-secondary)',
                    borderRadius: '20px', padding: '2px',
                    border: '0.5px solid var(--color-border-tertiary)'
                  }}>
                    <button
                      onClick={() => onChangeQty(item.id, -1)}
                      style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-primary)',
                        fontSize: '16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'sans-serif'
                      }}>−</button>
                    <span style={{
                      fontSize: '13px', fontWeight: '600',
                      minWidth: '20px', textAlign: 'center',
                      color: 'var(--color-text-primary)'
                    }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onChangeQty(item.id, 1)}
                      style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-primary)',
                        fontSize: '16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'sans-serif'
                      }}>+</button>
                  </div>

                  <p style={{
                    fontSize: '13px', fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    minWidth: '52px', textAlign: 'right', margin: 0
                  }}>
                    ₹{(item.price * item.qty).toFixed(0)}
                  </p>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: 'none',
                      background: 'var(--color-background-danger)',
                      color: 'var(--color-text-danger)',
                      fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0
                    }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: '0 0 8px'
          }}>Discount</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number" placeholder="0" min="0"
              value={discountValue}
              onChange={e => onSetDiscountValue(e.target.value)}
              style={{
                flex: 1, padding: '10px 14px',
                background: 'var(--color-background-secondary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: '10px', fontSize: '14px',
                color: 'var(--color-text-primary)', outline: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}
            />
            <select
              value={discountType}
              onChange={e => onSetDiscountType(e.target.value)}
              style={{
                width: '90px', padding: '10px 10px',
                background: 'var(--color-background-secondary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: '10px', fontSize: '13px',
                color: 'var(--color-text-primary)', outline: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              <option value="FLAT">₹ Off</option>
              <option value="PERCENTAGE">% Off</option>
            </select>
          </div>
        </div>

        {/* Totals */}
        <div style={{
          padding: '14px 16px', marginBottom: '16px',
          background: 'var(--color-background-secondary)',
          borderRadius: '12px',
          border: '0.5px solid var(--color-border-tertiary)'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '13px', color: 'var(--color-text-secondary)',
            marginBottom: '6px'
          }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountValue && (
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '13px', color: 'var(--color-text-danger)',
              marginBottom: '6px'
            }}>
              <span>Discount</span>
              <span>−₹{discountAmt.toFixed(2)}</span>
            </div>
          )}
          {isCredit && (
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '12px', color: 'var(--color-text-danger)',
              marginBottom: '6px'
            }}>
              <span>Credit sale</span>
              <span>Added to balance</span>
            </div>
          )}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: '10px',
            borderTop: '0.5px solid var(--color-border-tertiary)'
          }}>
            <span style={{
              fontSize: '15px', fontWeight: '600',
              color: 'var(--color-text-primary)'
            }}>Total</span>
            <span style={{
              fontSize: '18px', fontWeight: '600',
              color: 'var(--color-text-primary)', letterSpacing: '-0.5px'
            }}>
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: '12px',
            background: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-border-danger)',
            borderRadius: '10px',
            fontSize: '13px', color: 'var(--color-text-danger)'
          }}>{error}</div>
        )}

        {/* Checkout button */}
        <button
          onClick={onCheckout}
          disabled={processing || cart.length === 0}
          style={{
            width: '100%', padding: '14px',
            fontSize: '15px', fontWeight: '600',
            borderRadius: '14px', border: 'none',
            background: cart.length === 0 || processing
              ? 'var(--color-background-secondary)' : '#1a3c1a',
            color: cart.length === 0 || processing
              ? 'var(--color-text-secondary)' : 'white',
            cursor: cart.length === 0 || processing
              ? 'not-allowed' : 'pointer',
            marginBottom: '8px', transition: 'all 0.15s',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-0.2px'
          }}>
          {processing ? 'Processing...' : 'Checkout'}
        </button>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            style={{
              width: '100%', padding: '10px',
              fontSize: '13px', fontWeight: '400',
              borderRadius: '10px', border: 'none',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}>
            Clear order
          </button>
        )}

        {/* Receipt */}
        {receipt && (
          <div style={{
            marginTop: '12px', padding: '14px 16px',
            background: 'var(--color-background-success)',
            border: '0.5px solid var(--color-border-success)',
            borderRadius: '12px'
          }}>
            <p style={{
              fontSize: '13px', fontWeight: '600',
              color: 'var(--color-text-success)',
              margin: '0 0 10px'
            }}>
              Sale complete · {receipt.receiptNo}
            </p>
            <button
              onClick={onPrintReceipt}
              style={{
                width: '100%', padding: '10px',
                fontSize: '13px', fontWeight: '500',
                borderRadius: '10px',
                border: '0.5px solid var(--color-border-success)',
                background: 'var(--color-background-primary)',
                color: 'var(--color-text-success)',
                cursor: 'pointer', marginBottom: '6px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>
              Print receipt
            </button>
            <button
              onClick={onDismissReceipt}
              style={{
                width: '100%', padding: '8px',
                fontSize: '12px', border: 'none',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductGrid({ loading, filtered, products, cart, addToCart }) {
  if (loading) return (
    <div style={{
      textAlign: 'center', padding: '60px',
      color: 'var(--color-text-secondary)', fontFamily: SF.page.fontFamily
    }}>
      Loading products...
    </div>
  )

  if (filtered.length === 0) return (
    <div style={{
      textAlign: 'center', padding: '60px',
      color: 'var(--color-text-secondary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: '16px', fontFamily: SF.page.fontFamily
    }}>
      <p style={{
        fontSize: '15px', fontWeight: '500',
        color: 'var(--color-text-primary)', margin: '0 0 6px'
      }}>
        {products.length === 0 ? 'No products' : 'No results'}
      </p>
      <p style={{ fontSize: '13px', margin: 0 }}>
        {products.length === 0
          ? 'Add products from the Products page'
          : 'Try a different search'}
      </p>
    </div>
  )

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
      gap: '10px'
    }}>
      {filtered.map(p => {
        const inCart = cart.find(i => i.id === p.id)?.qty || 0
        const isOut = p.stockQty === 0

        return (
          <div
            key={p.id}
            onClick={() => addToCart(p)}
            style={{
              background: 'var(--color-background-primary)',
              border: inCart > 0
                ? '1.5px solid #1a3c1a'
                : '0.5px solid var(--color-border-tertiary)',
              borderRadius: '14px',
              padding: '12px',
              cursor: isOut ? 'not-allowed' : 'pointer',
              opacity: isOut ? 0.45 : 1,
              transition: 'border-color 0.12s',
              userSelect: 'none',
              position: 'relative',
              fontFamily: SF.page.fontFamily
            }}
          >
            {/* Cart badge */}
            {inCart > 0 && (
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#1a3c1a', color: 'white',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px', fontWeight: '600', zIndex: 1
              }}>
                {inCart}
              </div>
            )}

            {/* Image */}
            {p.imageUrl ? (
              <img
                src={p.imageUrl} alt={p.name} loading="lazy"
                style={{
                  width: '100%', height: '72px', objectFit: 'cover',
                  borderRadius: '8px', marginBottom: '10px',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{
                width: '100%', height: '72px', borderRadius: '8px',
                marginBottom: '10px',
                background: 'var(--color-background-secondary)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>🌿</div>
            )}

            {/* Name */}
            <p style={{
              fontSize: '12px', fontWeight: '500',
              color: 'var(--color-text-primary)',
              margin: '0 0 2px', lineHeight: 1.35,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
            }}>
              {p.name}
            </p>

            {/* Category */}
            <p style={{
              fontSize: '11px', color: 'var(--color-text-secondary)',
              margin: '0 0 8px'
            }}>
              {p.categoryName}
            </p>

            {/* Price + stock */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '14px', fontWeight: '600',
                color: 'var(--color-text-primary)', letterSpacing: '-0.3px'
              }}>
                ₹{parseFloat(p.price).toFixed(0)}
              </span>
              <span style={{
                fontSize: '11px', fontWeight: '500',
                padding: '2px 7px', borderRadius: '20px',
                background: isOut
                  ? 'var(--color-background-danger)'
                  : p.stockQty <= p.lowStockThreshold
                    ? 'var(--color-background-warning)'
                    : 'var(--color-background-success)',
                color: isOut
                  ? 'var(--color-text-danger)'
                  : p.stockQty <= p.lowStockThreshold
                    ? 'var(--color-text-warning)'
                    : 'var(--color-text-success)',
              }}>
                {isOut ? 'Out' : p.stockQty}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Checkout() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerVillage, setCustomerVillage] = useState('')
  const [customerLookup, setCustomerLookup] = useState(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [isCredit, setIsCredit] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [discountValue, setDiscountValue] = useState('')
  const [discountType, setDiscountType] = useState('FLAT')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searching, setSearching] = useState(false)

  const searchTimer = useRef(null)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => { fetchAll() }, [])
  useEffect(() => {
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.allSettled([
        api.get('/products?page=0&size=1000'),
        api.get('/categories')
      ])
      if (pRes.status === 'fulfilled') {
        const data = pRes.value.data
        setProducts(Array.isArray(data) ? data : (data?.products || []))
      }
      if (cRes.status === 'fulfilled')
        setCategories(Array.isArray(cRes.value.data) ? cRes.value.data : [])
    } catch {}
    finally { setLoading(false) }
  }

  const searchCustomers = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]); setShowSuggestions(false); return
    }
    setSearching(true)
    try {
      const res = await api.get(`/customers/search?query=${query}`)
      const r = Array.isArray(res.data) ? res.data : []
      setSuggestions(r); setShowSuggestions(r.length > 0)
    } catch { setSuggestions([]) }
    finally { setSearching(false) }
  }, [])

  const handlePhoneChange = useCallback((value) => {
    setCustomerPhone(value); setCustomerLookup(null)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return }
    searchTimer.current = setTimeout(() => searchCustomers(value), 400)
    if (value.length === 10) {
      setLookingUp(true)
      api.get(`/customers/phone/${value}`)
        .then(res => {
          if (res.data) {
            setCustomerLookup(res.data)
            setCustomerName(res.data.name || '')
            setCustomerVillage(res.data.village || '')
            setSuggestions([]); setShowSuggestions(false)
          }
        })
        .catch(() => setCustomerLookup(null))
        .finally(() => setLookingUp(false))
    }
  }, [searchCustomers])

  const handleVillageChange = useCallback((value) => {
    setCustomerVillage(value)
    if (customerLookup) return
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (value.length >= 3)
      searchTimer.current = setTimeout(() => searchCustomers(value), 400)
  }, [customerLookup, searchCustomers])

  const selectCustomer = useCallback((c) => {
    setCustomerPhone(c.phone || ''); setCustomerName(c.name || '')
    setCustomerVillage(c.village || ''); setCustomerLookup(c)
    setSuggestions([]); setShowSuggestions(false)
    if (searchTimer.current) clearTimeout(searchTimer.current)
  }, [])

  const addToCart = useCallback((p) => {
    if (!p || p.stockQty === 0) return
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id)
      if (ex) {
        if (ex.qty >= p.stockQty) return prev
        return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, {
        id: p.id, name: p.name,
        price: parseFloat(p.price), qty: 1, maxQty: p.stockQty
      }]
    })
  }, [])

  const changeQty = useCallback((id, delta) => {
    setCart(prev => prev
      .map(i => i.id === id
        ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.maxQty)) }
        : i)
      .filter(i => i.qty > 0))
  }, [])

  const removeItem = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCart([]); setCustomerName(''); setCustomerPhone('')
    setCustomerVillage(''); setCustomerLookup(null)
    setSuggestions([]); setShowSuggestions(false)
    setDiscountValue(''); setIsCredit(false)
    setPaymentMethod('CASH'); setError('')
    if (searchTimer.current) clearTimeout(searchTimer.current)
  }, [])

  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0)

  const discountAmt = (() => {
    const v = parseFloat(discountValue) || 0
    if (!v) return 0
    if (discountType === 'PERCENTAGE')
      return Math.min(subtotal, subtotal * v / 100)
    return Math.min(subtotal, v)
  })()

  const grandTotal = Math.max(0, subtotal - discountAmt)

  const handleCheckout = async () => {
    if (cart.length === 0) return setError('Cart is empty')
    if (!currentUser.id) {
      localStorage.clear(); window.location.href = '/login'; return
    }
    setProcessing(true); setError('')
    try {
      const res = await api.post('/sales/checkout', {
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || null,
        customerVillage: customerVillage.trim() || null,
        paymentMethod, isCredit, soldById: currentUser.id,
        items: cart.map(i => ({ productId: i.id, quantity: i.qty })),
        discountValue: parseFloat(discountValue) || null,
        discountType: discountValue ? discountType : null,
      })
      setReceipt(res.data); clearCart(); fetchAll()
    } catch (e) { setError(e.message || 'Checkout failed') }
    finally { setProcessing(false) }
  }

  const printReceipt = () => {
    if (!receipt) return
    const items = (receipt.items || []).map(i =>
      `<tr>
        <td>${i.productName}</td>
        <td style="text-align:center">x${i.quantity}</td>
        <td style="text-align:right">Rs.${parseFloat(i.lineTotal).toFixed(2)}</td>
      </tr>`
    ).join('')
    const disc = receipt.discountValue
      ? `<tr><td colspan="2">Discount</td>
         <td style="text-align:right">-Rs.${discountAmt.toFixed(2)}</td></tr>` : ''
    const w = window.open('', '_blank', 'width=360,height=720')
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Courier New',monospace;width:80mm;padding:4mm;font-size:12px;color:#000}
      @media print{@page{width:80mm;margin:0}body{padding:2mm}.no-print{display:none}}
      .c{text-align:center}.b{font-weight:bold}.s{font-size:11px;color:#555}
      .div{border-top:1px dashed #000;margin:6px 0}
      table{width:100%;border-collapse:collapse}
      .tot td{font-weight:bold;font-size:14px;padding-top:4px}
      .btn{display:block;width:100%;padding:10px;margin-top:12px;background:#1a3c1a;
           color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer}
    </style></head><body>
    <div class="c b" style="font-size:16px">VIJAYASREE STORES</div>
    <div class="c s">Pesticides & Seeds · Madanapalli</div>
    <div class="div"></div>
    <div class="s">Receipt : <b>${receipt.receiptNo}</b></div>
    <div class="s">Date    : ${new Date(receipt.createdAt).toLocaleString('en-IN')}</div>
    <div class="s">Customer: ${receipt.customerName || 'Walk-in'}${receipt.customerVillage ? ` (${receipt.customerVillage})` : ''}</div>
    ${receipt.customerPhone ? `<div class="s">Phone   : ${receipt.customerPhone}</div>` : ''}
    <div class="s">Cashier : ${currentUser.name || 'Staff'}</div>
    <div class="s">Payment : ${receipt.isCredit ? 'CREDIT SALE' : receipt.paymentMethod}</div>
    <div class="div"></div>
    <table>
      <thead><tr>
        <th style="text-align:left;font-size:11px">Item</th>
        <th style="text-align:center;font-size:11px">Qty</th>
        <th style="text-align:right;font-size:11px">Amt</th>
      </tr></thead>
      <tbody>${items}</tbody>
    </table>
    <div class="div"></div>
    <table>
      <tr><td colspan="2">Subtotal</td>
          <td style="text-align:right">Rs.${parseFloat(receipt.subtotal).toFixed(2)}</td></tr>
      ${disc}
      <tr class="tot">
        <td colspan="2">TOTAL</td>
        <td style="text-align:right">Rs.${parseFloat(receipt.grandTotal).toFixed(2)}</td>
      </tr>
    </table>
    <div class="div"></div>
    <div class="c s">Thank you for shopping with us!</div>
    <div class="c s">GST Invoice available on request</div>
    <button class="btn no-print" onclick="window.print();window.close()">Print Receipt</button>
    </body></html>`)
    w.document.close(); w.focus()
  }

  const filtered = (products || []).filter(p => {
    const q = search.toLowerCase()
    return (!q || p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)) &&
           (!filterCat || p.categoryName === filterCat)
  })

  const cartProps = {
    cart, customerPhone, customerName, customerVillage,
    customerLookup, lookingUp, searching, showSuggestions,
    suggestions, isCredit, paymentMethod, discountValue,
    discountType, subtotal, grandTotal, discountAmt,
    processing, receipt, error,
    onPhoneChange: handlePhoneChange,
    onNameChange: setCustomerName,
    onVillageChange: handleVillageChange,
    onSelectCustomer: selectCustomer,
    onSetPayment: setPaymentMethod,
    onToggleCredit: () => setIsCredit(p => !p),
    onChangeQty: changeQty,
    onRemoveItem: removeItem,
    onSetDiscountValue: setDiscountValue,
    onSetDiscountType: setDiscountType,
    onCheckout: handleCheckout,
    onClearCart: clearCart,
    onPrintReceipt: printReceipt,
    onDismissReceipt: () => setReceipt(null),
    onHideSuggestions: () => setShowSuggestions(false),
  }

  return (
    <div style={{ fontFamily: SF.page.fontFamily }}>

      {/* Page title */}
      <p style={{
        fontSize: '22px', fontWeight: '600',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.5px', margin: '0 0 20px'
      }}>
        Point of Sale
      </p>

      {/* Search + filter */}
      <div style={{
        display: 'flex', gap: '8px',
        marginBottom: '16px', flexWrap: 'wrap'
      }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '190px',
            padding: '10px 14px',
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '10px', fontSize: '19px',
            color: 'var(--color-text-primary)', outline: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}
        />
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{
            minWidth: '140px',
            padding: '10px 12px',
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '10px', fontSize: '14px',
            color: 'var(--color-text-primary)', outline: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Auto responsive grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Products */}
        <div>
          <ProductGrid
            loading={loading}
            filtered={filtered}
            products={products}
            cart={cart}
            addToCart={addToCart}
          />
        </div>

        {/* Cart */}
        <div style={{ minWidth: '320px' }}>
          <CartPanel {...cartProps} />
        </div>
      </div>
    </div>
  )
}