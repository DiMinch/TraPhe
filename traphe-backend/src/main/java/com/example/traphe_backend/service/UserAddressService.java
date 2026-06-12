package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateUserAddressRequest;
import com.example.traphe_backend.dto.request.UpdateUserAddressRequest;
import com.example.traphe_backend.dto.response.UserAddressResponse;
import java.util.List;
import java.util.UUID;

public interface UserAddressService {
    public List<UserAddressResponse> getAddressesByUser(String email);
    public UserAddressResponse getAddressById(String email, UUID addressId);
    public UserAddressResponse createAddress(String email, CreateUserAddressRequest request);
    public UserAddressResponse updateAddress(String email, UUID addressId, UpdateUserAddressRequest request);
    public void deleteAddress(String email, UUID addressId);
    public UserAddressResponse setDefaultAddress(String email, UUID addressId);
}