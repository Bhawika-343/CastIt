package com.smartvoting.backend.repositories;

import com.smartvoting.backend.models.Poll;
import com.smartvoting.backend.models.User;
import com.smartvoting.backend.models.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    boolean existsByUserAndPoll(User user, Poll poll);
}
