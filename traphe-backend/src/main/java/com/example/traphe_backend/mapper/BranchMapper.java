package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.BranchHourResponse;
import com.example.traphe_backend.dto.response.BranchResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.BranchHour;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BranchMapper {

    @Mapping(target = "id", source = "branch.id")
    @Mapping(target = "name", source = "branch.name")
    @Mapping(target = "address", source = "branch.address")
    @Mapping(target = "lat", source = "branch.lat")
    @Mapping(target = "lng", source = "branch.lng")
    @Mapping(target = "phone", source = "branch.phone")
    @Mapping(target = "isActive", source = "branch.active")
    @Mapping(target = "hours", source = "hours")
    BranchResponse toResponse(Branch branch, List<BranchHour> hours);

    @Mapping(target = "isClosed", source = "closed")
    BranchHourResponse toHourResponse(BranchHour hour);
}
