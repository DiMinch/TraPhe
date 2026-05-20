package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateUserAddressRequest;
import com.example.traphe_backend.dto.request.UpdateUserAddressRequest;
import com.example.traphe_backend.dto.response.UserAddressResponse;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.entity.UserAddress;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.UserAddressRepository;
import com.example.traphe_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;

    private static final int MAX_ADDRESSES_PER_USER = 10;

    /**
     * Lấy danh sách tất cả địa chỉ của user (địa chỉ mặc định ở đầu).
     */
    public List<UserAddressResponse> getAddressesByUser(String email) {
        User user = findUserByEmail(email);
        List<UserAddress> addresses = userAddressRepository
                .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(user.getId());
        return addresses.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết 1 địa chỉ.
     */
    public UserAddressResponse getAddressById(String email, UUID addressId) {
        User user = findUserByEmail(email);
        UserAddress address = userAddressRepository
                .findByIdAndUserIdAndIsDeletedFalse(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));
        return mapToResponse(address);
    }

    /**
     * Tạo mới địa chỉ giao hàng.
     */
    @Transactional
    public UserAddressResponse createAddress(String email, CreateUserAddressRequest request) {
        User user = findUserByEmail(email);

        // Giới hạn số lượng địa chỉ
        long count = userAddressRepository.countByUserIdAndIsDeletedFalse(user.getId());
        if (count >= MAX_ADDRESSES_PER_USER) {
            throw new IllegalArgumentException(
                    "Bạn chỉ được lưu tối đa " + MAX_ADDRESSES_PER_USER + " địa chỉ giao hàng.");
        }

        // Nếu set default hoặc đây là địa chỉ đầu tiên → clear default cũ
        boolean shouldBeDefault = request.isDefault() || count == 0;
        if (shouldBeDefault) {
            userAddressRepository.clearDefaultForUser(user.getId());
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .addressLine(request.getAddressLine())
                .wardCode(request.getWardCode())
                .wardName(request.getWardName())
                .provinceCode(request.getProvinceCode())
                .provinceName(request.getProvinceName())
                .isDefault(shouldBeDefault)
                .build();

        UserAddress saved = userAddressRepository.save(address);
        log.info("User {} created address {}", email, saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Cập nhật địa chỉ (partial update).
     */
    @Transactional
    public UserAddressResponse updateAddress(String email, UUID addressId, UpdateUserAddressRequest request) {
        User user = findUserByEmail(email);
        UserAddress address = userAddressRepository
                .findByIdAndUserIdAndIsDeletedFalse(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

        if (request.getRecipientName() != null) address.setRecipientName(request.getRecipientName());
        if (request.getRecipientPhone() != null) address.setRecipientPhone(request.getRecipientPhone());
        if (request.getAddressLine() != null) address.setAddressLine(request.getAddressLine());
        if (request.getWardCode() != null) address.setWardCode(request.getWardCode());
        if (request.getWardName() != null) address.setWardName(request.getWardName());
        if (request.getProvinceCode() != null) address.setProvinceCode(request.getProvinceCode());
        if (request.getProvinceName() != null) address.setProvinceName(request.getProvinceName());

        if (request.getIsDefault() != null && request.getIsDefault() && !address.isDefault()) {
            userAddressRepository.clearDefaultForUser(user.getId());
            address.setDefault(true);
        }

        UserAddress saved = userAddressRepository.save(address);
        log.info("User {} updated address {}", email, addressId);
        return mapToResponse(saved);
    }

    /**
     * Soft delete địa chỉ.
     */
    @Transactional
    public void deleteAddress(String email, UUID addressId) {
        User user = findUserByEmail(email);
        UserAddress address = userAddressRepository
                .findByIdAndUserIdAndIsDeletedFalse(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

        address.setDeleted(true);

        // Nếu xoá địa chỉ mặc định → đặt địa chỉ khác làm mặc định
        if (address.isDefault()) {
            address.setDefault(false);
            userAddressRepository.save(address);

            userAddressRepository
                    .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(user.getId())
                    .stream()
                    .findFirst()
                    .ifPresent(nextDefault -> {
                        nextDefault.setDefault(true);
                        userAddressRepository.save(nextDefault);
                    });
        } else {
            userAddressRepository.save(address);
        }

        log.info("User {} deleted address {}", email, addressId);
    }

    /**
     * Đặt 1 địa chỉ làm mặc định.
     */
    @Transactional
    public UserAddressResponse setDefaultAddress(String email, UUID addressId) {
        User user = findUserByEmail(email);
        UserAddress address = userAddressRepository
                .findByIdAndUserIdAndIsDeletedFalse(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

        userAddressRepository.clearDefaultForUser(user.getId());
        address.setDefault(true);
        UserAddress saved = userAddressRepository.save(address);

        log.info("User {} set default address {}", email, addressId);
        return mapToResponse(saved);
    }

    // ---- Helpers ----

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
    }

    private UserAddressResponse mapToResponse(UserAddress address) {
        String fullAddress = String.join(", ",
                address.getAddressLine(),
                address.getWardName(),
                address.getProvinceName());

        return UserAddressResponse.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .recipientPhone(address.getRecipientPhone())
                .addressLine(address.getAddressLine())
                .wardCode(address.getWardCode())
                .wardName(address.getWardName())
                .provinceCode(address.getProvinceCode())
                .provinceName(address.getProvinceName())
                .isDefault(address.isDefault())
                .fullAddress(fullAddress)
                .createdAt(address.getCreatedAt())
                .build();
    }
}
