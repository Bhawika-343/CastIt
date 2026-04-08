package com.smartvoting.backend.controllers;

import com.smartvoting.backend.dto.PollRequest;
import com.smartvoting.backend.dto.VoteRequest;
import com.smartvoting.backend.models.Poll;
import com.smartvoting.backend.models.PollOption;
import com.smartvoting.backend.models.User;
import com.smartvoting.backend.models.Vote;
import com.smartvoting.backend.repositories.PollOptionRepository;
import com.smartvoting.backend.repositories.PollRepository;
import com.smartvoting.backend.repositories.UserRepository;
import com.smartvoting.backend.repositories.VoteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/polls")
public class PollController {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;

    public PollController(PollRepository pollRepository, PollOptionRepository pollOptionRepository,
                          UserRepository userRepository, VoteRepository voteRepository) {
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.userRepository = userRepository;
        this.voteRepository = voteRepository;
    }

    @GetMapping
    public List<Poll> getAllPolls() {
        return pollRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Poll> getPollById(@PathVariable Long id) {
        return pollRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPoll(@RequestBody PollRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        if (request.getOptions() == null || request.getOptions().size() < 2) {
            return ResponseEntity.badRequest().body("Poll must have at least 2 options");
        }

        Poll poll = new Poll();
        poll.setQuestion(request.getQuestion());
        poll.setCategory(request.getCategory() != null ? request.getCategory() : "General");
        poll.setExpiresAt(request.getExpiresAt());
        poll.setCreatedBy(user);

        for (String optionText : request.getOptions()) {
            PollOption option = new PollOption();
            option.setText(optionText);
            poll.addOption(option);
        }

        Poll savedPoll = pollRepository.save(poll);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPoll);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(@PathVariable Long id, @RequestBody VoteRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        Optional<Poll> pollOpt = pollRepository.findById(id);
        if (pollOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Poll poll = pollOpt.get();

        if (poll.getExpiresAt() != null && java.time.LocalDateTime.now().isAfter(poll.getExpiresAt())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("This poll has expired and is no longer accepting votes.");
        }

        if (voteRepository.existsByUserAndPoll(user, poll)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User has already voted on this poll");
        }

        Optional<PollOption> optionOpt = pollOptionRepository.findById(request.getOptionId());
        if (optionOpt.isEmpty() || !optionOpt.get().getPoll().getId().equals(poll.getId())) {
            return ResponseEntity.badRequest().body("Invalid option for this poll");
        }

        PollOption option = optionOpt.get();
        option.setVoteCount(option.getVoteCount() + 1);
        pollOptionRepository.save(option);

        Vote vote = new Vote();
        vote.setUser(user);
        vote.setPoll(poll);
        vote.setPollOption(option);
        voteRepository.save(vote);

        return ResponseEntity.ok("Vote cast successfully");
    }
}
