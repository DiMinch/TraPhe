package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.BranchMenuItem;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.MenuItemSize;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PricingService {

    public BigDecimal calculateItemUnitPrice(MenuItem menuItem, BranchMenuItem branchMenuItem, MenuItemSize menuItemSize) {
        if (menuItemSize != null) {
            return menuItemSize.getSellingPrice();
        } else if (branchMenuItem.getCustomPrice() != null) {
            return branchMenuItem.getCustomPrice();
        } else if (menuItem.getBasePrice() != null) {
            return menuItem.getBasePrice();
        } else {
            throw new IllegalArgumentException("Không thể xác định giá cho món '" + menuItem.getName() + "'. Chưa có size hoặc giá gốc.");
        }
    }

    public BigDecimal calculateItemSubtotal(BigDecimal unitPrice, BigDecimal toppingTotalPerCup, int quantity) {
        return unitPrice.add(toppingTotalPerCup).multiply(BigDecimal.valueOf(quantity));
    }

    public BigDecimal calculateFinalAmount(BigDecimal subtotal, BigDecimal totalDiscount, BigDecimal shippingFee) {
        return subtotal.subtract(totalDiscount).add(shippingFee);
    }
}
